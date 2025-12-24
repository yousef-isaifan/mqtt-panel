import { query } from './db';
import { getMqttClient } from './mqtt-service';

interface AutomationRule {
  id: number;
  name: string;
  enabled: boolean;
  condition_type: string;
  condition_device_id: string;
  condition_value: string;
  action_type: string;
  action_device_id: string;
  action_payload: Record<string, unknown>;
}

interface DeviceTopicMap {
  [deviceId: string]: string;
}

const DEVICE_TOPICS: DeviceTopicMap = {
  ac_living_room: 'smarthome/ac/living_room/command',
  light_living_room: 'smarthome/light/living_room/command',
};

// Track last triggered time to prevent rapid re-triggering
const lastTriggered = new Map<number, number>();
const TRIGGER_COOLDOWN = 8000; // 8 seconds cooldown to prevent spam

export async function evaluateAutomationRules(
  deviceId: string,
  value: number | string
): Promise<void> {
  try {
    // Fetch all enabled rules for this device
    const result = await query(
      'SELECT * FROM automation_rules WHERE enabled = true AND condition_device_id = $1',
      [deviceId]
    );

    const rules: AutomationRule[] = result.rows;

    for (const rule of rules) {
      const shouldTrigger = evaluateCondition(rule, value);

      if (shouldTrigger) {
        // Check cooldown
        const lastTriggerTime = lastTriggered.get(rule.id) || 0;
        const now = Date.now();

        if (now - lastTriggerTime < TRIGGER_COOLDOWN) {
          console.log(`[Automation] Rule "${rule.name}" in cooldown, skipping (${Math.round((TRIGGER_COOLDOWN - (now - lastTriggerTime)) / 1000)}s remaining)`);
          continue;
        }

        console.log(`[Automation] Triggering rule: ${rule.name} (condition: ${rule.condition_type}, value: ${value})`);
        await executeAction(rule, value);
        lastTriggered.set(rule.id, now);
      }
    }
  } catch (error) {
    console.error('[Automation] Error evaluating rules:', error);
  }
}

function evaluateCondition(rule: AutomationRule, currentValue: number | string): boolean {
  const { condition_type, condition_value } = rule;

  switch (condition_type) {
    case 'temperature_above':
      return typeof currentValue === 'number' && currentValue > parseFloat(condition_value);

    case 'temperature_below':
      return typeof currentValue === 'number' && currentValue < parseFloat(condition_value);

    case 'temperature_equals':
      return typeof currentValue === 'number' && currentValue === parseFloat(condition_value);

    case 'device_state_equals':
      return String(currentValue).toLowerCase() === String(condition_value).toLowerCase();

    case 'device_state_not_equals':
      return String(currentValue).toLowerCase() !== String(condition_value).toLowerCase();

    default:
      console.warn(`[Automation] Unknown condition type: ${condition_type}`);
      return false;
  }
}

async function executeAction(rule: AutomationRule, triggerValue: number | string): Promise<void> {
  try {
    const { action_device_id, action_payload } = rule;
    const mqttClient = getMqttClient();

    if (!mqttClient || !mqttClient.connected) {
      throw new Error('MQTT client not connected');
    }

    // Get the device's command topic
    const topic = DEVICE_TOPICS[action_device_id];
    if (!topic) {
      throw new Error(`No MQTT topic found for device: ${action_device_id}`);
    }

    // Publish the action
    const payload = typeof action_payload === 'string' 
      ? action_payload 
      : JSON.stringify(action_payload);

    await new Promise<void>((resolve, reject) => {
      mqttClient.publish(topic, payload, { qos: 0 }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Log successful execution
    await logAutomationExecution(rule.id, String(triggerValue), 'success');
    console.log(`[Automation] ✓ Executed action for rule: ${rule.name}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Automation] Failed to execute action:`, error);
    
    // Log failed execution
    await logAutomationExecution(
      rule.id,
      String(triggerValue),
      'failed',
      errorMessage
    );
  }
}

async function logAutomationExecution(
  ruleId: number,
  conditionValue: string,
  result: 'success' | 'failed',
  errorMessage?: string
): Promise<void> {
  try {
    await query(
      `INSERT INTO automation_logs (rule_id, condition_value, action_result, error_message)
       VALUES ($1, $2, $3, $4)`,
      [ruleId, conditionValue, result, errorMessage || null]
    );
  } catch (error) {
    console.error('[Automation] Failed to log execution:', error);
  }
}

// Helper function to add new device topic mapping
export function registerDeviceTopic(deviceId: string, topic: string): void {
  DEVICE_TOPICS[deviceId] = topic;
}
