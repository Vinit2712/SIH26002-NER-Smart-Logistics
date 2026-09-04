Project Structure :
## Project Structure

```
riskroute/
├── public/                      # Static assets
├── src/
│   ├── assets/                  # Images, icons used in the app
│   │
│   ├── components/              # Reusable UI components
│   │   ├── Sidebar.jsx          # Left navigation (Dashboard/Map/Routes/Logistics/Alerts)
│   │   ├── Header.jsx           # Top bar with platform name + live status
│   │   ├── StatCard.jsx         # Summary metric card (used on Dashboard)
│   │   ├── RiskBadge.jsx        # Colored risk-level badge (accessible/at-risk/inaccessible)
│   │   ├── StatusIndicator.jsx  # Colored dot + label for delivery status
│   │   ├── MapView.jsx          # Leaflet map — roads, vehicles, risk color-coding
│   │   ├── RouteCard.jsx        # Recommended/alternative route display card
│   │   ├── VehicleTable.jsx     # Logistics vehicle status table
│   │   └── AlertPanel.jsx       # Alerts list with severity + description
│   │
│   ├── pages/                   # Route-level pages (mapped via react-router-dom)
│   │   ├── Dashboard.jsx        # Command-center overview
│   │   ├── MapPage.jsx          # Full-screen live risk map
│   │   ├── Routes.jsx           # Route Intelligence (origin/destination planner)
│   │   ├── Logistics.jsx        # Full vehicle logistics table
│   │   └── Alerts.jsx           # Full alerts panel
│   │
│   ├── mockData/                # Centralized mock data (no hardcoding in components)
│   │   ├── districts.js         # District list + accessibility status
│   │   ├── roads.js             # Road network with risk status + coordinates
│   │   ├── routes.js            # Recommended vs alternative route data
│   │   ├── vehicles.js          # Vehicle fleet status + coordinates
│   │   ├── alerts.js            # Active alerts (severity, location, description)
│   │   └── risks.js             # AI/ML-predicted risk records per road
│   │
│   ├── services/
│   │   └── api.js               # Service layer — returns mock data now,
│   │                             #   structured to swap in real backend calls later
│   │
│   ├── App.jsx                  # Root component — layout + routing setup
│   ├── App.css
│   ├── index.css                # Tailwind entry point
│   └── main.jsx                 # React app entry point
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
