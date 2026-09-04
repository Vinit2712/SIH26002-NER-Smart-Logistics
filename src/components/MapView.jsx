import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from "react-leaflet";
import { roads as mockRoads } from "../mockData/roads";
import { vehicles as mockVehicles } from "../mockData/vehicles";

// ---- GIS MAP LAYER ----
// Uses real Leaflet + OpenStreetMap tiles, with mock road/vehicle data
// overlaid using real lat/lng coordinates. When a backend is connected,
// only the data source (mockRoads / mockVehicles) needs to change —
// the rendering layer below stays the same.

const STATUS_COLORS = {
  accessible: "#16a34a",
  at_risk: "#ca8a04",
  inaccessible: "#dc2626",
};

/// Centered roughly over the North Eastern Region
const NER_CENTER = [25.8, 92.5];
const DEFAULT_ZOOM = 7;

// Restricts panning/zooming to roughly the NER + immediate border area
const NER_BOUNDS = [
  [21.5, 87.5], // southwest corner
  [29.5, 97.5], // northeast corner
];
const MIN_ZOOM = 6;

function MapView({ height = "h-96" }) {
  return (
    <div className={`relative border border-slate-200 rounded-sm overflow-hidden ${height}`}>
     <MapContainer
  center={NER_CENTER}
  zoom={DEFAULT_ZOOM}
  minZoom={MIN_ZOOM}
  maxBounds={NER_BOUNDS}
  maxBoundsViscosity={1.0}
  scrollWheelZoom={true}
  style={{ height: "100%", width: "100%" }}
>
<TileLayer
  attribution='Tiles &copy; Esri &mdash; Source: Esri, HERE, Garmin, FAO, NOAA, USGS'
  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
  maxZoom={19}
/>

        {/* roads */}
        {mockRoads.map((road) => (
          <Polyline
            key={road.id}
            positions={road.coordinates}
            pathOptions={{
              color: STATUS_COLORS[road.status] || "#94a3b8",
              weight: 5,
              opacity: 0.85,
            }}
          >
            <Popup>
              <strong>{road.name}</strong>
              <br />
              {road.from} → {road.to}
              <br />
              Status: {road.status.replace("_", " ")}
              {road.riskReason && (
                <>
                  <br />
                  <em>{road.riskReason}</em>
                </>
              )}
            </Popup>
          </Polyline>
        ))}

        {/* vehicles */}
        {mockVehicles.map((v) => (
          <CircleMarker
            key={v.id}
            center={v.coordinates}
            radius={7}
            pathOptions={{
              color: "white",
              weight: 2,
              fillColor: "#1d4ed8",
              fillOpacity: 1,
            }}
          >
            <Popup>
              <strong>{v.id}</strong>
              <br />
              {v.origin} → {v.destination}
              <br />
              At: {v.currentLocation}
              <br />
              Commodity: {v.commodity}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* legend */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white border border-slate-200 rounded-sm px-3 py-2 text-xs space-y-1 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.accessible }}></span>
          Accessible
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.at_risk }}></span>
          At Risk
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS.inaccessible }}></span>
          Inaccessible
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-700"></span>
          Vehicle
        </div>
      </div>

      {/* mock data disclosure */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-800/80 text-white text-[10px] px-2 py-1 rounded-sm">
        Live map · mock road/vehicle data
      </div>
    </div>
  );
}

export default MapView;
