# Quick Setup Guide

## 1. Prerequisites Installation

### Install Node.js (if not installed)
Download from: https://nodejs.org/ (v18 or higher)

### Install PostgreSQL (if not installed)
**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Run installer and remember your postgres password

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

### Install Mosquitto MQTT Broker (if not installed)

**Windows:**
- Download from: https://mosquitto.org/download/
- Install and run as service

**Linux:**
```bash
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
```

**macOS:**
```bash
brew install mosquitto
brew services start mosquitto
```

### Configure Mosquitto with Authentication

Create/edit Mosquitto config file:

**Linux/macOS:** `/etc/mosquitto/mosquitto.conf`
**Windows:** `C:\Program Files\mosquitto\mosquitto.conf`

```conf
listener 1883
allow_anonymous false
password_file C:\Program Files\mosquitto\passwd
```

Create password file:
```bash
# Linux/macOS
sudo mosquitto_passwd -c /etc/mosquitto/passwd mqttuser

# Windows (run as Administrator)
mosquitto_passwd -c "C:\Program Files\mosquitto\passwd" mqttuser
```

Enter password when prompted: `mqttpass`

Restart Mosquitto:
```bash
# Linux
sudo systemctl restart mosquitto

# macOS
brew services restart mosquitto

# Windows (run as Administrator)
net stop mosquitto
net start mosquitto
```

## 2. Project Setup

### Install Dependencies
```bash
npm install
```

### Configure Environment
```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local with your PostgreSQL credentials
```

### Create Database
```bash
# Option 1: Using psql directly
psql -U postgres -c "CREATE DATABASE mqtt_dashboard;"

# Option 2: Using setup script (will also run schema)
npm run db:setup
```

## 3. Run the Application

Start the development server:
```bash
npm run dev
```

The app will:
1. Auto-run database migrations on first load
2. Connect to MQTT broker
3. Be available at http://localhost:3000

## 4. Test with Virtual Devices

Install Python dependencies:
```bash
pip install paho-mqtt requests
```

Run virtual devices in separate terminals:

```bash
# Terminal 1: Temperature sensor
python scripts/virtual_temp_sensor.py

# Terminal 2: Smart light  
python scripts/virtual_light.py
```

## 5. Verify Everything Works

1. Open http://localhost:3000 in your browser
2. You should see:
   - Green "Connected" status in the header
   - Temperature readings updating every 5 seconds
   - Light control buttons (ON/OFF)
   - Temperature chart with historical data

## Troubleshooting

### Database Connection Error
```
Error: password authentication failed for user "postgres"
```
**Fix:** Update `POSTGRES_PASSWORD` in `.env.local` with correct password

### MQTT Connection Error
```
Error: Connection refused
```
**Fix:** 
1. Check if Mosquitto is running
2. Verify credentials in `.env.local` match Mosquitto password file
3. Check firewall allows port 1883

### Port Already in Use
```
Error: Port 3000 is already in use
```
**Fix:** Stop other apps using port 3000 or run on different port:
```bash
PORT=3001 npm run dev
```

### Python Script Can't Connect
```
Connection refused (111)
```
**Fix:**
1. Ensure Mosquitto is running
2. Check broker credentials in Python scripts match your configuration

## Next Steps

- Modify MQTT topics in `lib/mqtt-service.ts` for your devices
- Add more devices in database schema
- Customize dashboard UI in `app/page.tsx`
- Add more sensors/controls as needed

For detailed documentation, see [README.md](README.md)
