# React Management UI (Vite + Redux Toolkit + React Router)

A modern, responsive dashboard interface designed for the Express & MongoDB API with state management, Axios request/response interceptors, and complete API endpoint coverage.

---

## 📁 Architecture & Folder Structure

```
UI/
├── .env                                  # Environment variables (VITE_API_BASE_URL)
├── .env.example                          # Environment template
├── .gitignore
├── index.html                            # HTML entry point with fonts
├── package.json                          # Scripts and dependencies
├── vite.config.js                        # Vite configuration
└── src/
    ├── api/
    │   ├── axiosClient.js                # Custom Axios instance with Request/Response interceptors
    │   ├── endpoints.js                  # Centralized endpoint paths
    │   ├── healthApi.js                  # Health check & root API methods
    │   ├── buildingStuffsApi.js          # Building Stuffs API methods
    │   └── logApi.js                     # Hit & Log API methods
    ├── app/
    │   ├── rootReducer.js                # Combined Redux reducers
    │   └── store.js                      # Redux store with Axios dispatch bridge
    ├── features/                         # Redux Toolkit slices
    │   ├── health/healthSlice.js         # Health check state & thunks
    │   ├── buildingStuffs/buildingStuffsSlice.js # Building items CRUD & hit
    │   ├── hitLogger/hitLoggerSlice.js   # Interactive hit tester & session history
    │   ├── logs/logsSlice.js             # MongoDB log collection browser & pagination
    │   └── notifications/notificationSlice.js # Global toast alerts
    ├── components/
    │   ├── common/
    │   │   ├── Navbar.jsx                # Top header with live API status indicator
    │   │   ├── NotificationToast.jsx     # Auto-dismissing toast alerts
    │   │   ├── LoadingSpinner.jsx        # Reusable spinner
    │   │   └── StatusBadge.jsx           # Status badge with pulse animations
    │   └── layout/
    │       └── MainLayout.jsx            # App layout wrapper
    ├── pages/
    │   ├── HealthPage.jsx                # Route '/' strictly dedicated to Health Check
    │   ├── BuildingStuffsPage.jsx        # Route '/building-stuffs'
    │   ├── HitLoggerPage.jsx             # Route '/hit-logger'
    │   ├── LogsPage.jsx                  # Route '/logs'
    │   └── NotFoundPage.jsx              # 404 handler
    ├── styles/
    │   └── index.css                     # Design tokens & responsive styling
    ├── App.jsx                           # Route setup
    └── main.jsx                          # React DOM initialization
```

---

## ⚙️ Environment Variables

The frontend connects to the backend API via [.env](file:///c:/Users/balaj/AI%20Building/UI/.env):

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🛡️ Axios Interceptor Architecture

Configured in `src/api/axiosClient.js`:

1. **Request Interceptor**:
   - Injects a unique `x-request-id` header for request tracing.
   - Attaches `performance.now()` start timestamp to compute round-trip latency.
   - Logs outgoing payloads in development mode.

2. **Response Interceptor**:
   - Calculates exact response duration (`ms`) and appends it to response objects.
   - Standardizes network, 4xx, and 5xx errors into clean messages.
   - Automatically dispatches error toast notifications to the Redux store (`notificationSlice`), eliminating repetitive try-catch notification logic across components.

---

## 🚦 Routes Breakdown

| Route | Page | Purpose |
|---|---|---|
| `/` | `HomePage` | **Application Dashboard & Hub**: Overview card list with quick navigation links to all API modules |
| `/boilerplate` | `HealthPage` | **Boilerplate Diagnostics & Health Check**: Uptime, response latency, auto-polling toggle, raw JSON diagnostics, backend route directory |
| `/building-stuffs` | `BuildingStuffsPage` | View all items, add new item, and trigger tracked hits to `/building-stuffs/hit` |
| `/hit-logger` | `HitLoggerPage` | Interactive hit payload composer with presets (User action, Sensor telemetry, System notice) |
| `/logs` | `LogsPage` | MongoDB Log Explorer with table pagination, view raw document details, and clear logs |

---

## 🏃‍♂️ Running the UI

```bash
cd "c:\Users\balaj\AI Building\UI"

# Start the Vite development server on http://localhost:3000
npm run dev

# Build for production
npm run build
```
