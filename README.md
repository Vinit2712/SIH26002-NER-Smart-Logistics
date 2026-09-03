# 🏔️ RISKROUTE | AI-Powered North-East India Disaster Logistics & Resilient Routing Platform

> **Smart India Hackathon (SIH) Flagship Project**  
> *Autonomous Real-Time Road Monitoring, Landslide/Flood Hazard Prediction, and Automated Dynamic Rerouting for Emergency Supply Convoys across the North-East Region (NER) Corridor.*

---

## 🎯 Problem Statement & Challenge

Transporting essential goods (medicines, vaccines, liquid medical oxygen, disaster food rations, and fuel) in North-East India (Assam, Meghalaya, Arunachal Pradesh, Tripura, Manipur, Nagaland, Mizoram, Sikkim) is severely hindered by:
- Sudden landslides & slope collapses triggered by high-intensity rainfall (>100mm/hr cloudbursts).
- Flash floods and mountain stream culvert submergence.
- Single-artery bottlenecks (e.g. NH-6 through Ri-Bhoi, NH-10 Sikkim lifeline, NH-13 Bhalukpong pass).
- Remote valley communication blackouts where field officers lose cellular connectivity.

---

## 💡 Solution Overview

**RISKROUTE** delivers a resilient, operations-grade disaster response infrastructure combining:
1. **🖥️ Central Operations Command Room Dashboard (Web - React + MapLibre GL + Tailwind CSS + Framer Motion)**:
   - High-contrast tactical command center designed according to Government of India / NDMA / MoRTH operations standards.
   - Interactive GIS 3D terrain map with multi-layer road accessibility visualization:
     - 🟢 **Open Roads** (Normal transit)
     - 🟡 **Degraded Roads** (Rainfall sloshing, slow single-lane traffic)
     - 🔴 **Blocked Roads** (Active landslides, rockfalls, severe debris flow)
     - 🔵 **AI Resilient Alternate Bypasses** (Safe rerouting paths)
   - Real-time KPI statistics: Active Incidents, Blocked Arteries, Degraded Segments, AI High-Risk Zones, Active Convoys, Rerouted Convoys.
   - Tactical Incident Audit Panel with photographic evidence, severity rating (1–5), GPS coordinates, officer contact, and 1-click verification/reroute.
   - Side-by-side **Before & After Route Recalculation Engine** showing ETA deltas (+16m), distance deltas (+12.4km), and AI reasoning.
   - **Geospatial Risk Matrix** evaluating multi-factor satellite and IoT sensor feeds (Rainfall mm/hr, Slope gradient in degrees, Soil saturation %, and Historical 10-year GSI incident density).
   - Real-time fleet telemetry tracking (Speed, Fuel, Bearing, Cargo Manifest, Priority).
   - Live WebSocket alert ticker with tactical synthesized Web Audio sound alerts.

2. **📱 Field Officer Mobile Application (Flutter + In-Browser Simulator)**:
   - Built for extreme terrains with **Offline-First Resilience**:
     - Automatically caches reports locally when cellular connectivity is severed.
     - Displays *"Saved offline — will sync automatically when connection returns."*
     - Auto-syncs pending queued incidents the moment network connectivity is re-established.
   - One-tap incident reporting with automatic DGPS coordinates, severity scale 1–5, and geo-tagged camera capture.

3. **🚚 Driver In-Cab HUD Application (Flutter + In-Browser Simulator)**:
   - High-contrast, minimal distraction in-cab tablet interface (yellow-on-black military HUD).
   - Displays real-time speed, destination, and dynamic ETA.
   - **Emergency Intercept Screen**:
     ```
     ⚠️ ROUTE BLOCKED
     Reason: Major Landslide reported ahead on NH-6 Km 48.2
     🔄 NEW ROUTE AVAILABLE
     New ETA: 2h 21m (Via SH-17 Ri-Bhoi East Bypass)
     [ START NEW ROUTE ]
     ```
   - Tapping **START NEW ROUTE** redraws the navigation HUD to the safe bypass corridor immediately.

---

## 🎬 The Golden SIH Demo Scenario

The entire system is orchestrated around the end-to-end mission demonstration:
```
[Field Officer on NH-6]
         │  Reports landslide with GPS & photo (Online or Offline cache)
         ▼
[Central Control Room]
         │  Incident beacon flashes; NH-6 Segment 4471 turns RED BLOCKED
         │  Risk engine calculates hazard score 0.89; siren sounds
         ▼
[AI Dynamic Routing Engine]
         │  Recalculates bypass via SH-17 Ri-Bhoi East (+16 mins, Zero Hazard)
         │  Dispatcher triggers automated reroute order
         ▼
[Driver In-Cab HUD (MED-001)]
         │  Flashing audio-visual alert: "⚠️ ROUTE BLOCKED — NEW ROUTE AVAILABLE"
         │  Driver taps "START NEW ROUTE"
         ▼
[Safe Delivery Accomplished]
            Convoy bypasses blocked zone; vital medical cargo arrives on time!
```

---

## 🛠️ Tech Stack

- **Web Control Room**: React 19, MapLibre GL, Tailwind CSS, Lucide Icons, Framer Motion, Web Audio API Sound Synthesizer.
- **Mobile Applications**: Flutter 3.x, Provider, Shared Preferences / SQFlite offline repository.
- **GIS Cartography**: MapLibre GL 3D vector styling with Dark Matter raster basemaps & custom GeoJSON road layers.
- **Backend Architecture**: FastAPI-compatible schema contracts (`/api/v1/incidents`, `/api/v1/roads/segments`, `/api/v1/routing/recalculate`, `/ws/v1/telemetry`).

---

## 🚀 Running Locally

### 1. Web Control Room Dashboard
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 2. Flutter Mobile Application
```bash
cd mobile_app
flutter pub get
flutter run
```

---

## 🌐 SIH Live Pitch Helper
Click the **"RUN SIH DEMO SCENARIO"** button in the top navigation bar of the Web Control Room to launch a guided, step-by-step interactive walkthrough that controls all screens and devices in real time!
