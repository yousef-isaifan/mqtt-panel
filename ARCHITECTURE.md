# Project Structure

```
mqtt-panel/
│
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── devices/
│   │   │   └── status/
│   │   │       └── route.ts      # GET device status endpoint
│   │   ├── init/
│   │   │   └── route.ts          # App initialization endpoint
│   │   ├── light/
│   │   │   └── control/
│   │   │       └── route.ts      # POST light control endpoint
│   │   ├── mqtt/
│   │   │   └── status/
│   │   │       └── route.ts      # GET MQTT status endpoint
│   │   ├── sensor/
│   │   │   └── data/
│   │   │       └── route.ts      # POST sensor data endpoint
│   │   └── temperature/
│   │       └── history/
│   │           └── route.ts      # GET temperature history endpoint
│   ├── favicon.ico
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with initialization
│   └── page.tsx                  # Main dashboard page
│
├── components/                   # React Components
│   ├── InitializeApp.tsx         # App initialization wrapper
│   ├── LightControl.tsx          # Light ON/OFF control
│   └── TemperatureChart.tsx      # Recharts temperature visualization
│
├── db/                           # Database
│   └── schema.sql                # PostgreSQL schema & migrations
│
├── lib/                          # Shared Libraries
│   ├── db.ts                     # PostgreSQL connection pool
│   ├── hooks.ts                  # React hooks for data fetching
│   ├── init.ts                   # Application initialization
│   ├── migrate.ts                # Database migration runner
│   ├── mqtt-service.ts           # MQTT client service
│   └── queries.ts                # Database query functions
│
├── scripts/                      # Utility Scripts
│   ├── post_sensor_data.py       # HTTP API test script
│   ├── README.md                 # Scripts documentation
│   ├── setup-db.js               # Database setup script
│   ├── virtual_light.py          # Virtual smart light simulator
│   └── virtual_temp_sensor.py    # Virtual temperature sensor simulator
│
├── .env.example                  # Environment variables template
├── .env.local                    # Environment variables (create this)
├── .gitignore                    # Git ignore rules
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # NPM dependencies & scripts
├── postcss.config.mjs            # PostCSS configuration
├── README.md                     # Main documentation
├── SETUP.md                      # Setup guide
└── tsconfig.json                 # TypeScript configuration

Key Files Overview:
═══════════════════════════════════════════════════════════════

Backend Logic:
- lib/mqtt-service.ts    → MQTT broker connection & message handling
- lib/db.ts              → PostgreSQL connection pool management  
- lib/queries.ts         → All database queries (CRUD operations)
- lib/init.ts            → App startup initialization

Frontend:
- app/page.tsx           → Main dashboard UI
- components/            → Reusable React components
- lib/hooks.ts           → Custom hooks for data fetching

API Layer:
- app/api/               → REST API endpoints for frontend & external access

Database:
- db/schema.sql          → Complete database schema with tables & indexes

Testing:
- scripts/*.py           → Virtual IoT device simulators for testing
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    MQTT Broker (Mosquitto)                  │
│                     127.0.0.1:1883                          │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
             │ Subscribe                      │ Publish
             │                                │
    ┌────────▼────────┐              ┌───────▼────────┐
    │  Temperature    │              │  Smart Light    │
    │  Sensor Topics  │              │  Command Topic  │
    └────────┬────────┘              └───────┬────────┘
             │                                │
             │ Messages                       │ Commands
             │                                │
    ┌────────▼────────────────────────────────▼────────┐
    │          Next.js MQTT Service                    │
    │          (lib/mqtt-service.ts)                   │
    └────────┬────────────────────────────────┬────────┘
             │                                │
             │ Store Data                     │ Publish
             │                                │
    ┌────────▼────────┐              ┌───────▼────────┐
    │   PostgreSQL    │              │  MQTT Broker   │
    │   Database      │              │  (publish cmd)  │
    └────────┬────────┘              └────────────────┘
             │
             │ Query Data
             │
    ┌────────▼────────┐
    │   API Routes    │
    │  (app/api/*)    │
    └────────┬────────┘
             │
             │ HTTP/JSON
             │
    ┌────────▼────────┐
    │   Dashboard UI  │
    │  (app/page.tsx) │
    │                 │
    │  - Temp Chart   │
    │  - Light Ctrl   │
    │  - Status       │
    └─────────────────┘
```

## Technology Choices

**Why Next.js App Router?**
- Server-side API routes for backend logic
- React Server Components for better performance
- Built-in routing and API endpoints
- TypeScript support out of the box

**Why PostgreSQL?**
- ACID compliance for reliable data storage
- Time-series data support for sensor readings
- Complex queries for analytics
- Mature and widely supported

**Why MQTT.js?**
- Native Node.js MQTT client
- Supports QoS levels
- Automatic reconnection
- WebSocket support if needed

**Why Recharts?**
- React-native charting library
- Responsive and customizable
- Good TypeScript support
- Easy to use with time-series data
