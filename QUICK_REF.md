# Quick Reference Card

## 🚀 Start Development

```bash
npm run dev
```
Dashboard → http://localhost:3000

## 📡 MQTT Topics

### Subscribe (App listens to):
```
smarthome/sensor/temperature/living_room/state
smarthome/sensor/temperature/living_room/availability
smarthome/light/living_room/state
```

### Publish (App sends to):
```
smarthome/light/living_room/command
```

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/devices/status` | Current device status |
| GET | `/api/temperature/history?hours=24` | Temperature history |
| POST | `/api/sensor/data` | Post sensor data |
| POST | `/api/light/control` | Control light |
| GET | `/api/mqtt/status` | MQTT connection status |

## 🗄️ Database Tables

- `devices` - Device registry
- `temperature_readings` - Temp sensor data
- `device_states` - Light states (ON/OFF)
- `device_availability` - Device online/offline
- `mqtt_connection_status` - Connection history

## 🐍 Test Commands

```bash
# Temperature sensor
python scripts/virtual_temp_sensor.py

# Smart light
python scripts/virtual_light.py

# HTTP poster
python scripts/post_sensor_data.py
```

## 🔧 Environment Variables (.env.local)

```env
MQTT_BROKER_HOST=127.0.0.1
MQTT_BROKER_PORT=1883
MQTT_USERNAME=mqttuser
MQTT_PASSWORD=mqttpass

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=mqtt_dashboard
```

## 📝 NPM Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Production server
npm run lint       # Run linter
npm run db:setup   # Setup database
```

## 🔍 Troubleshooting

### MQTT Not Connected
1. Check Mosquitto: `systemctl status mosquitto` (Linux)
2. Verify credentials in `.env.local`
3. Test: `mosquitto_sub -h 127.0.0.1 -u mqttuser -P mqttpass -t '#'`

### Database Error
1. Check PostgreSQL: `systemctl status postgresql` (Linux)
2. Verify credentials
3. Check database exists: `psql -U postgres -l`

### No Data Showing
1. Check MQTT status indicator (green = connected)
2. Run virtual devices
3. Check browser console (F12)
4. Check server terminal for errors

## 📊 Data Flow

```
Device → MQTT → Next.js → PostgreSQL → API → UI
```

## 🎨 Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main dashboard UI |
| `lib/mqtt-service.ts` | MQTT connection & handlers |
| `lib/db.ts` | Database connection |
| `lib/queries.ts` | Database queries |
| `app/api/*/route.ts` | API endpoints |
| `db/schema.sql` | Database schema |

## 📦 Dependencies

**Core:**
- Next.js 16 - Framework
- MQTT.js 5 - MQTT client
- pg 8 - PostgreSQL driver
- Recharts 3 - Charts
- date-fns 4 - Date utilities

## 🎯 Default Credentials

**MQTT:**
- Host: 127.0.0.1:1883
- User: mqttuser
- Pass: mqttpass

**PostgreSQL:**
- Host: localhost:5432
- User: postgres
- Pass: password (change this!)
- DB: mqtt_dashboard

## 📞 Useful Commands

```bash
# PostgreSQL
psql -U postgres                    # Connect to PostgreSQL
\l                                  # List databases
\c mqtt_dashboard                   # Connect to database
\dt                                 # List tables
\d devices                          # Describe table

# Mosquitto
mosquitto_sub -h 127.0.0.1 -u mqttuser -P mqttpass -t '#'  # Subscribe to all
mosquitto_pub -h 127.0.0.1 -u mqttuser -P mqttpass -t 'test/topic' -m 'hello'  # Publish

# Node
npm list                            # List installed packages
npm outdated                        # Check for updates
```

## 🚨 Common Errors

| Error | Solution |
|-------|----------|
| `ECONNREFUSED` | Start Mosquitto/PostgreSQL |
| `password authentication failed` | Fix `.env.local` credentials |
| `Port 3000 in use` | Kill process or use different port |
| `Cannot find module` | Run `npm install` |
| `MQTT not connected` | Check Mosquitto running & credentials |

---

**Need help?** Check README.md or SETUP.md
