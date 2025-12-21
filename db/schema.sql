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

-- Create automation_rules table
CREATE TABLE IF NOT EXISTS automation_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT true,
    condition_type VARCHAR(50) NOT NULL, -- 'temperature_above', 'temperature_below', 'device_state'
    condition_device_id VARCHAR(255) NOT NULL,
    condition_value VARCHAR(100) NOT NULL, -- threshold value or state to check
    action_type VARCHAR(50) NOT NULL, -- 'set_ac', 'set_light', 'set_device'
    action_device_id VARCHAR(255) NOT NULL,
    action_payload JSONB NOT NULL, -- JSON payload to send
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (condition_device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- Create automation_logs table
CREATE TABLE IF NOT EXISTS automation_logs (
    id SERIAL PRIMARY KEY,
    rule_id INTEGER NOT NULL,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    condition_value VARCHAR(100), -- actual value that triggered the rule
    action_result VARCHAR(20) NOT NULL, -- 'success', 'failed'
    error_message TEXT,
    FOREIGN KEY (rule_id) REFERENCES automation_rules(id) ON DELETE CASCADE
);

-- Create indexes for automation tables
CREATE INDEX IF NOT EXISTS idx_automation_rules_enabled 
    ON automation_rules(enabled, condition_device_id);

CREATE INDEX IF NOT EXISTS idx_automation_logs_rule_timestamp 
    ON automation_logs(rule_id, triggered_at DESC);

-- Insert initial devices
INSERT INTO devices (device_id, device_name, device_type, location, mqtt_topic)
VALUES 
    ('temp_living_room', 'Living Room Temperature Sensor', 'temperature_sensor', 'Living Room', 'smarthome/sensor/temperature/living_room/state'),
    ('light_living_room', 'Living Room Smart Light', 'light', 'Living Room', 'smarthome/light/living_room/state'),
    ('ac_living_room', 'Living Room AC', 'air_conditioner', 'Living Room', 'smarthome/ac/living_room/command')
ON CONFLICT (device_id) DO NOTHING;

-- Insert initial connection status
INSERT INTO mqtt_connection_status (status, message)
VALUES ('disconnected', 'System initialized');
