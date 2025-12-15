-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) NOT NULL, -- 'temperature_sensor', 'light', etc.
    location VARCHAR(255),
    mqtt_topic VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create temperature_readings table
CREATE TABLE IF NOT EXISTS temperature_readings (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    temperature DECIMAL(5, 2) NOT NULL,
    unit VARCHAR(10) DEFAULT 'celsius',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- Create device_states table (for lights, switches, etc.)
CREATE TABLE IF NOT EXISTS device_states (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    state VARCHAR(50) NOT NULL, -- 'ON', 'OFF', etc.
    brightness INTEGER,
    color VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- Create device_availability table
CREATE TABLE IF NOT EXISTS device_availability (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    availability VARCHAR(20) NOT NULL, -- 'online', 'offline'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- Create mqtt_connection_status table
CREATE TABLE IF NOT EXISTS mqtt_connection_status (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL, -- 'connected', 'disconnected', 'reconnecting'
    message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_temperature_readings_device_timestamp 
    ON temperature_readings(device_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_device_states_device_timestamp 
    ON device_states(device_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_device_availability_device_timestamp 
    ON device_availability(device_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_mqtt_status_timestamp 
    ON mqtt_connection_status(timestamp DESC);

-- Insert initial devices
INSERT INTO devices (device_id, device_name, device_type, location, mqtt_topic)
VALUES 
    ('temp_living_room', 'Living Room Temperature Sensor', 'temperature_sensor', 'Living Room', 'smarthome/sensor/temperature/living_room/state'),
    ('light_living_room', 'Living Room Smart Light', 'light', 'Living Room', 'smarthome/light/living_room/state')
ON CONFLICT (device_id) DO NOTHING;

-- Insert initial connection status
INSERT INTO mqtt_connection_status (status, message)
VALUES ('disconnected', 'System initialized');
