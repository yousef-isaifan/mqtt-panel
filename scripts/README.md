# Python Virtual Device Scripts

These Python scripts simulate IoT devices for testing the MQTT Dashboard.

## Requirements

Install required Python packages:

```bash
pip install paho-mqtt requests
```

## Scripts

### 1. Virtual Temperature Sensor (`virtual_temp_sensor.py`)

Simulates a temperature sensor publishing data via MQTT.

**Usage:**
```bash
python scripts/virtual_temp_sensor.py
```

**What it does:**
- Connects to MQTT broker
- Publishes temperature readings every 5 seconds to `smarthome/sensor/temperature/living_room/state`
- Publishes availability status to `smarthome/sensor/temperature/living_room/availability`
- Generates realistic temperature variations around 22°C

### 2. Virtual Smart Light (`virtual_light.py`)

Simulates a smart light that responds to ON/OFF commands.

**Usage:**
```bash
python scripts/virtual_light.py
```

**What it does:**
- Connects to MQTT broker
- Subscribes to `smarthome/light/living_room/command`
- Responds to ON/OFF commands
- Publishes state changes to `smarthome/light/living_room/state`
- Publishes availability status

### 3. HTTP Sensor Data Poster (`post_sensor_data.py`)

Posts sensor data directly to the Next.js API (alternative to MQTT).

**Usage:**
```bash
python scripts/post_sensor_data.py
```

**What it does:**
- Posts temperature data to `/api/sensor/data` endpoint
- Useful for testing external sensor integration
- Bypasses MQTT and writes directly to database

## Testing Workflow

1. Start the Next.js application:
   ```bash
   npm run dev
   ```

2. In separate terminals, run the virtual devices:
   ```bash
   # Terminal 1: Temperature sensor
   python scripts/virtual_temp_sensor.py
   
   # Terminal 2: Smart light
   python scripts/virtual_light.py
   ```

3. Open the dashboard at http://localhost:3000

4. You should see:
   - Temperature readings updating every 5 seconds
   - Light control working (ON/OFF buttons)
   - Real-time status updates
   - Historical temperature chart

## Troubleshooting

- **Connection refused**: Ensure Mosquitto MQTT broker is running
- **Import errors**: Install required packages with `pip install paho-mqtt requests`
- **Wrong credentials**: Check MQTT credentials in the scripts match your broker configuration
