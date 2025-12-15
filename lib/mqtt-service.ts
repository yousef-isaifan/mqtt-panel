import mqtt from 'mqtt';
import {
  insertTemperatureReading,
  insertDeviceState,
  insertDeviceAvailability,
  insertConnectionStatus,
} from './queries';

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
    }
  } catch (error) {
    // If not JSON, try parsing as plain number
    const temperature = parseFloat(payload);
    if (!isNaN(temperature)) {
      await insertTemperatureReading('temp_living_room', temperature, 'celsius');
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

export async function publishLightCommand(command: 'ON' | 'OFF') {
  if (!mqttClient || !mqttClient.connected) {
    throw new Error('MQTT client not connected');
  }

  return new Promise<void>((resolve, reject) => {
    mqttClient!.publish(TOPICS.LIGHT_COMMAND, command, { qos: 1 }, (err) => {
      if (err) {
        console.error('[MQTT] Failed to publish light command:', err);
        reject(err);
      } else {
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
