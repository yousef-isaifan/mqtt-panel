import mqtt from 'mqtt';
import {
  insertTemperatureReading,
  insertDeviceState,
  insertDeviceAvailability,
  insertConnectionStatus,
} from './queries';
import { evaluateAutomationRules } from './automation-engine';

let mqttClient: mqtt.MqttClient | null = null;
let isInitialized = false;

const MQTT_CONFIG = {
  host: process.env.MQTT_BROKER_HOST || '127.0.0.1',
  port: parseInt(process.env.MQTT_BROKER_PORT || '1883'),
  username: process.env.MQTT_USERNAME || 'mqttuser',
  password: process.env.MQTT_PASSWORD || 'mqttpass',
};

const TOPICS = {
  TEMP_STATE: 'smarthome/sensor/temperature/living_room/state',
  TEMP_AVAILABILITY: 'smarthome/sensor/temperature/living_room/availability',
  LIGHT_STATE: 'smarthome/light/living_room/state',
  LIGHT_COMMAND: 'smarthome/light/living_room/command',
  LIGHT_AVAILABILITY: 'smarthome/light/living_room/availability',
  AC_STATE: 'smarthome/ac/living_room/state',
  AC_COMMAND: 'smarthome/ac/living_room/command',
  AC_AVAILABILITY: 'smarthome/ac/living_room/availability',
};

export function getMqttClient(): mqtt.MqttClient | null {
  return mqttClient;
}

export function initializeMqttService() {
  if (isInitialized) {
    return;
  }

  const brokerUrl = `mqtt://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}`;

  mqttClient = mqtt.connect(brokerUrl, {
    username: MQTT_CONFIG.username,
    password: MQTT_CONFIG.password,
    clientId: `mqtt_dashboard_${Math.random().toString(16).substr(2, 8)}`,
    clean: true,
    reconnectPeriod: 5000,
  });

  mqttClient.on('connect', () => {
    console.log('[MQTT] ✓ Connected');
    insertConnectionStatus('connected', 'Successfully connected to MQTT broker').catch(console.error);

    // Subscribe to all topics
    const topicsToSubscribe = [
      TOPICS.TEMP_STATE,
      TOPICS.TEMP_AVAILABILITY,
      TOPICS.LIGHT_STATE,
      TOPICS.LIGHT_AVAILABILITY,
      TOPICS.AC_STATE,
      TOPICS.AC_AVAILABILITY,
    ];

    topicsToSubscribe.forEach((topic) => {
      mqttClient?.subscribe(topic, (err) => {
        if (err) {
          console.error(`[MQTT] Failed to subscribe to ${topic}:`, err);
        }
      });
    });
  });

  mqttClient.on('message', async (topic, message) => {
    const payload = message.toString();

    try {
      await handleMqttMessage(topic, payload);
    } catch (error) {
      console.error(`[MQTT] Error handling message from ${topic}:`, error);
    }
  });

  mqttClient.on('error', (error) => {
    console.error('MQTT connection error:', error);
    insertConnectionStatus('disconnected', `Error: ${error.message}`).catch(console.error);
  });

  mqttClient.on('offline', () => {
    console.log('MQTT client offline');
    insertConnectionStatus('disconnected', 'Client went offline').catch(console.error);
  });

  mqttClient.on('reconnect', () => {
    console.log('Attempting to reconnect to MQTT broker...');
    insertConnectionStatus('reconnecting', 'Attempting to reconnect').catch(console.error);
  });

  mqttClient.on('close', () => {
    console.log('MQTT connection closed');
  });

  isInitialized = true;
}

async function handleMqttMessage(topic: string, payload: string) {
  switch (topic) {
    case TOPICS.TEMP_STATE:
      await handleTemperatureState(payload);
      break;

    case TOPICS.TEMP_AVAILABILITY:
      await handleTemperatureAvailability(payload);
      break;

    case TOPICS.LIGHT_STATE:
      await handleLightState(payload);
      break;

    case TOPICS.LIGHT_AVAILABILITY:
      await handleLightAvailability(payload);
      break;

    case TOPICS.AC_STATE:
      await handleACState(payload);
      break;

    case TOPICS.AC_AVAILABILITY:
      await handleACAvailability(payload);
      break;

    default:
      console.log(`Unhandled topic: ${topic}`);
  }
}

async function handleTemperatureState(payload: string) {
  try {
    // Try parsing as JSON first
    const data = JSON.parse(payload);
    const temperature = typeof data === 'object' ? data.temperature : parseFloat(payload);
    const unit = data.unit || 'celsius';

    if (!isNaN(temperature)) {
      await insertTemperatureReading('temp_living_room', temperature, unit);
      // Evaluate automation rules for temperature changes
      await evaluateAutomationRules('temp_living_room', temperature);
    }
  } catch (error) {
    // If not JSON, try parsing as plain number
    const temperature = parseFloat(payload);
    if (!isNaN(temperature)) {
      await insertTemperatureReading('temp_living_room', temperature, 'celsius');
      // Evaluate automation rules for temperature changes
      await evaluateAutomationRules('temp_living_room', temperature);
    } else {
      console.error('Invalid temperature payload:', payload);
    }
  }
}

async function handleTemperatureAvailability(payload: string) {
  const availability = payload.toLowerCase();
  await insertDeviceAvailability('temp_living_room', availability);
}

async function handleLightState(payload: string) {
  try {
    // Try parsing as JSON first
    const data = JSON.parse(payload);
    const state = typeof data === 'object' ? data.state : payload.toUpperCase();
    const brightness = data.brightness;
    const color = data.color;

    await insertDeviceState('light_living_room', state, brightness, color);
  } catch (error) {
    // If not JSON, treat as simple ON/OFF state
    const state = payload.toUpperCase();
    await insertDeviceState('light_living_room', state);
  }
}

async function handleLightAvailability(payload: string) {
  const availability = payload.toLowerCase();
  await insertDeviceAvailability('light_living_room', availability);
}

async function handleACState(payload: string) {
  try {
    const data = JSON.parse(payload);
    const state = data.power || 'UNKNOWN';
    const temperature = data.temperature;
    
    // Store AC state in device_states with additional data in a format we can use
    await insertDeviceState('ac_living_room', state, temperature, data.fan_speed);
  } catch (error) {
    console.error('Invalid AC state payload:', payload);
  }
}

async function handleACAvailability(payload: string) {
  const availability = payload.toLowerCase();
  await insertDeviceAvailability('ac_living_room', availability);
}

export async function publishLightCommand(command: 'ON' | 'OFF') {
  if (!mqttClient || !mqttClient.connected) {
    throw new Error('MQTT client not connected');
  }

  return new Promise<void>((resolve, reject) => {
    mqttClient!.publish(TOPICS.LIGHT_COMMAND, command, { qos: 0 }, (err) => {
      if (err) {
        console.error('[MQTT] Failed to publish light command:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function publishACCommand(command: {
  power?: 'ON' | 'OFF';
  temperature?: number;
  fan_speed?: 'low' | 'medium' | 'high' | 'auto';
}) {
  console.log('[MQTT Service] publishACCommand called with:', command);
  console.log('[MQTT Service] Client exists:', !!mqttClient);
  console.log('[MQTT Service] Client connected:', mqttClient?.connected);
  
  if (!mqttClient || !mqttClient.connected) {
    console.error('[MQTT Service] MQTT client not connected');
    throw new Error('MQTT client not connected');
  }

  return new Promise<void>((resolve, reject) => {
    const payload = JSON.stringify(command);
    console.log('[MQTT Service] Publishing to topic:', TOPICS.AC_COMMAND);
    console.log('[MQTT Service] Payload:', payload);
    
    mqttClient!.publish(TOPICS.AC_COMMAND, payload, { qos: 0 }, (err) => {
      if (err) {
        console.error('[MQTT] Failed to publish AC command:', err);
        reject(err);
      } else {
        console.log('[MQTT] ✓ Published AC command successfully');
        resolve();
      }
    });
  });
}

export function disconnectMqtt() {
  if (mqttClient) {
    mqttClient.end();
    mqttClient = null;
    isInitialized = false;
    console.log('MQTT client disconnected');
  }
}
