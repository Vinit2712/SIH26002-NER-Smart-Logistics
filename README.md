Frontend Structure :


```
riskroute/
├── public/                      # Static assets
├── src/
│   ├── assets/                  # Images, icons used in the app
│   │
│   ├── context/                 # Shared app-wide state (React Context)
│   │   ├── AuthContext.jsx      # Login state + role (supplier/admin), mock credential checks
│   │   ├── AlertsContext.jsx    # Shared live alerts store (Emergency button → Admin Alerts)
│   │   └── VehiclesContext.jsx  # Shared live vehicle store (Supplier route changes → Admin views)
│   │
│   ├── components/              # Reusable UI components
│   │   ├── Sidebar.jsx          # Admin navigation (Dashboard/Map/Routes/Logistics/Alerts/Register Vehicle)
│   │   ├── Header.jsx           # Top bar — platform name, live status, logged-in user, logout
│   │   ├── ProtectedRoute.jsx   # Route guard — restricts pages by role (supplier/admin)
│   │   ├── StatCard.jsx         # Summary metric card (used on Admin Dashboard)
│   │   ├── RiskBadge.jsx        # Colored risk-level badge (accessible/at-risk/inaccessible)
│   │   ├── StatusIndicator.jsx  # Colored dot + label for delivery status
│   │   ├── MapView.jsx          # Leaflet map — supports "region" mode (Admin) and "driver" mode (Supplier)
│   │   ├── RouteCard.jsx        # Route option card — selectable on Supplier side, read-only on Admin side
│   │   ├── VehicleTable.jsx     # Logistics vehicle status table (Admin)
│   │   └── AlertPanel.jsx       # Alerts list with severity + description (Admin)
│   │
│   ├── pages/                   # Route-level pages (mapped via react-router-dom)
│   │   ├── Login.jsx            # Role-based login — Supplier (Vehicle ID) or Admin (username)
│   │   ├── Dashboard.jsx        # Admin command-center overview
│   │   ├── MapPage.jsx          # Admin full-screen live risk map
│   │   ├── Routes.jsx           # Admin Route Intelligence (origin/destination planner)
│   │   ├── Logistics.jsx        # Admin full vehicle logistics table
│   │   ├── Alerts.jsx           # Admin full alerts panel
│   │   ├── RegisterVehicle.jsx  # Admin — onboard a new vehicle + issue supplier login
│   │   └── DriverDashboard.jsx  # Supplier dashboard — select route, view risk/ETA, emergency alert
│   │
│   ├── mockData/                # Centralized mock data (no hardcoding in components)
│   │   ├── districts.js         # District list + accessibility status
│   │   ├── roads.js             # Road network with risk status + coordinates
│   │   ├── routes.js            # Route options per origin/destination (with risk score + reasons)
│   │   ├── vehicles.js          # Initial vehicle fleet (seed data for VehiclesContext)
│   │   ├── alerts.js            # Initial alerts (seed data for AlertsContext)
│   │   ├── risks.js             # AI/ML-predicted risk records per road
│   │   ├── credentials.js       # Hardcoded mock login credentials (supplier + admin)
│   │   └── locations.js         # Known locations + coordinates for route selection
│   │
│   ├── services/
│   │   └── api.js               # Service layer — returns mock data now,
│   │                             #   structured to swap in real backend calls later
│   │
│   ├── App.jsx                  # Root component — routing, role-based layouts, route protection
│   ├── App.css
│   ├── index.css                # Tailwind entry point + print styles (for route download)
│   └── main.jsx                 # React app entry point — wraps app with Auth/Alerts/Vehicles providers
│
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
