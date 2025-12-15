# MQTT Dashboard - Real-time Device Monitoring

A full-stack Next.js application for monitoring and controlling IoT devices via MQTT protocol with PostgreSQL persistence.

## Features

- 🔴 Real-time MQTT broker connection monitoring
- 🌡️ Temperature sensor data visualization with historical charts
- 💡 Smart light control (ON/OFF commands)
- 📊 Interactive temperature history charts (24-hour view)
- 🗄️ PostgreSQL database for persistent storage
- 🔄 Auto-refresh with polling (2-second intervals)
- 📡 RESTful API for external sensor integration
- 🎨 Modern dark-themed UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes, MQTT.js, PostgreSQL (pg)
- **Database**: PostgreSQL
- **MQTT Broker**: Mosquitto

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v12 or higher)
3. **Mosquitto MQTT Broker** running on `127.0.0.1:1883`

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# MQTT Broker Configuration
MQTT_BROKER_HOST=127.0.0.1
MQTT_BROKER_PORT=1883
MQTT_USERNAME=mqttuser
MQTT_PASSWORD=mqttpass

# PostgreSQL Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/mqtt_dashboard
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=mqtt_dashboard
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

### 3. Set Up PostgreSQL Database

Create the database:

```bash
psql -U postgres -c "CREATE DATABASE mqtt_dashboard;"
```

The database schema will be automatically created when you first run the application.

### 4. Run the Application

```bash
npm run dev
```

The dashboard will be available at [http://localhost:3000](http://localhost:3000)

## MQTT Topics

The application subscribes to the following topics:

### Temperature Sensor
- `smarthome/sensor/temperature/living_room/state` - Temperature readings
- `smarthome/sensor/temperature/living_room/availability` - Sensor availability (online/offline)

### Smart Light
- `smarthome/light/living_room/state` - Light state (ON/OFF)
- `smarthome/light/living_room/command` - Control commands (publish)

## API Endpoints

### Get Device Status
```http
GET /api/devices/status
```
Returns current status of all devices (temperature, light state, availability)

### Get Temperature History
```http
GET /api/temperature/history?hours=24
```
Returns temperature readings for the specified number of hours

### Post Sensor Data (External Integration)
```http
POST /api/sensor/data
Content-Type: application/json

{
  "device_id": "temp_living_room",
  "temperature": 23.5,
  "unit": "celsius"
}
```

### Control Light
```http
POST /api/light/control
Content-Type: application/json

{
  "command": "ON"  // or "OFF"
}
```

### Get MQTT Status
```http
GET /api/mqtt/status
```
Returns current MQTT connection status

## Python Sensor Script Example

You can post sensor data directly to the API from Python scripts:

```python
import requests
import time
import random

API_URL = "http://localhost:3000/api/sensor/data"

while True:
    temperature = round(20 + random.uniform(-2, 5), 2)
    
    payload = {
        "device_id": "temp_living_room",
        "temperature": temperature,
        "unit": "celsius"
    }
    
    try:
        response = requests.post(API_URL, json=payload)
        print(f"Posted temperature: {temperature}°C - Status: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")
    
    time.sleep(5)
```

## Database Schema

### Tables

- **devices** - Device registry (sensors, lights, etc.)
- **temperature_readings** - Temperature sensor data with timestamps
- **device_states** - Device states (ON/OFF, brightness, color)
- **device_availability** - Device availability status
- **mqtt_connection_status** - MQTT broker connection history

## Project Structure

```
mqtt-panel/
├── app/
│   ├── api/              # API routes
│   │   ├── devices/
│   │   ├── temperature/
│   │   ├── sensor/
│   │   ├── light/
│   │   ├── mqtt/
│   │   └── init/
│   ├── layout.tsx        # Root layout with initialization
│   └── page.tsx          # Main dashboard page
├── components/
│   ├── TemperatureChart.tsx
│   ├── LightControl.tsx
│   └── InitializeApp.tsx
├── lib/
│   ├── db.ts             # PostgreSQL connection pool
│   ├── queries.ts        # Database queries
│   ├── mqtt-service.ts   # MQTT client service
│   ├── migrate.ts        # Database migration runner
│   ├── init.ts           # Application initialization
│   └── hooks.ts          # React hooks for data fetching
├── db/
│   └── schema.sql        # Database schema
├── scripts/
│   ├── virtual_temp_sensor.py   # Virtual temperature sensor
│   ├── virtual_light.py         # Virtual smart light
│   └── post_sensor_data.py      # HTTP API poster
├── .env.local            # Environment variables (create from .env.example)
└── package.json
```

## Testing with Virtual Devices

Virtual Python devices are provided in the `scripts/` directory for testing:

```bash
# Terminal 1: Start temperature sensor
python scripts/virtual_temp_sensor.py

# Terminal 2: Start smart light
python scripts/virtual_light.py
```

See [scripts/README.md](scripts/README.md) for more details.

## Troubleshooting

### MQTT Connection Issues

1. Ensure Mosquitto is running:
   ```bash
   sudo systemctl status mosquitto
   ```

2. Check broker credentials in `.env.local`

3. Verify firewall allows connections to port 1883

### Database Connection Issues

1. Ensure PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Verify database credentials in `.env.local`

3. Check if database exists:
   ```bash
   psql -U postgres -l
   ```

### No Data Appearing

1. Check MQTT connection status in the dashboard header
2. Verify devices are publishing to the correct topics
3. Check browser console and server logs for errors

## License

MIT

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
