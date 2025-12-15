import { query } from './db';

export interface Device {
  id: number;
  device_id: string;
  device_name: string;
  device_type: string;
  location: string;
  mqtt_topic: string;
  created_at: Date;
  updated_at: Date;
}

export interface TemperatureReading {
  id: number;
  device_id: string;
  temperature: number;
  unit: string;
  timestamp: Date;
}

export interface DeviceState {
  id: number;
  device_id: string;
  state: string;
  brightness?: number;
  color?: string;
  timestamp: Date;
}

export interface DeviceAvailability {
  id: number;
  device_id: string;
  availability: string;
  timestamp: Date;
}

export interface MqttConnectionStatus {
  id: number;
  status: string;
  message?: string;
  timestamp: Date;
}

// Device queries
export async function getAllDevices(): Promise<Device[]> {
  const result = await query('SELECT * FROM devices ORDER BY device_name');
  return result.rows;
}

export async function getDeviceById(deviceId: string): Promise<Device | null> {
  const result = await query('SELECT * FROM devices WHERE device_id = $1', [deviceId]);
  return result.rows[0] || null;
}

// Temperature reading queries
export async function insertTemperatureReading(deviceId: string, temperature: number, unit: string = 'celsius') {
  await query(
    'INSERT INTO temperature_readings (device_id, temperature, unit) VALUES ($1, $2, $3)',
    [deviceId, temperature, unit]
  );
}

export async function getLatestTemperature(deviceId: string): Promise<TemperatureReading | null> {
  const result = await query(
    'SELECT * FROM temperature_readings WHERE device_id = $1 ORDER BY timestamp DESC LIMIT 1',
    [deviceId]
  );
  
  if (result.rows[0]) {
    return {
      ...result.rows[0],
      temperature: parseFloat(result.rows[0].temperature)
    };
  }
  
  return null;
}

export async function getTemperatureHistory(deviceId: string, hours: number = 24): Promise<TemperatureReading[]> {
  const result = await query(
    `SELECT * FROM temperature_readings 
     WHERE device_id = $1 AND timestamp > NOW() - INTERVAL '${hours} hours'
     ORDER BY timestamp ASC`,
    [deviceId]
  );
  
  return result.rows.map(row => ({
    ...row,
    temperature: parseFloat(row.temperature)
  }));
}

// Device state queries
export async function insertDeviceState(deviceId: string, state: string, brightness?: number, color?: string) {
  await query(
    'INSERT INTO device_states (device_id, state, brightness, color) VALUES ($1, $2, $3, $4)',
    [deviceId, state, brightness, color]
  );
}

export async function getLatestDeviceState(deviceId: string): Promise<DeviceState | null> {
  const result = await query(
    'SELECT * FROM device_states WHERE device_id = $1 ORDER BY timestamp DESC LIMIT 1',
    [deviceId]
  );
  return result.rows[0] || null;
}

// Device availability queries
export async function insertDeviceAvailability(deviceId: string, availability: string) {
  await query(
    'INSERT INTO device_availability (device_id, availability) VALUES ($1, $2)',
    [deviceId, availability]
  );
}

export async function getLatestAvailability(deviceId: string): Promise<DeviceAvailability | null> {
  const result = await query(
    'SELECT * FROM device_availability WHERE device_id = $1 ORDER BY timestamp DESC LIMIT 1',
    [deviceId]
  );
  return result.rows[0] || null;
}

// MQTT connection status queries
export async function insertConnectionStatus(status: string, message?: string) {
  await query(
    'INSERT INTO mqtt_connection_status (status, message) VALUES ($1, $2)',
    [status, message]
  );
}

export async function getLatestConnectionStatus(): Promise<MqttConnectionStatus | null> {
  const result = await query(
    'SELECT * FROM mqtt_connection_status ORDER BY timestamp DESC LIMIT 1'
  );
  return result.rows[0] || null;
}
