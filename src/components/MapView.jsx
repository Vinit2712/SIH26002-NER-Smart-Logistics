import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import { roads as mockRoads } from "../mockData/roads";
import { useVehicles } from "../context/VehiclesContext";

// ---- GIS MAP LAYER ----
// Two modes:
// "region" (default) — used on Admin Dashboard / Map page: shows ALL roads + ALL vehicles.
// "driver" — used on Supplier Dashboard: shows ONLY this vehicle's route options
//            (selected route highlighted, others dimmed), and only this vehicle's marker.

const STATUS_COLORS = {
  accessible: "#16a34a",
  at_risk: "#ca8a04",
  inaccessible: "#dc2626",
};

const ROUTE_RISK_COLORS = {
  low: "#16a34a",
  medium: "#ca8a04",
  high: "#ea580c",
  critical: "#dc2626",
};

const NER_CENTER = [25.8, 92.5];
const DEFAULT_ZOOM = 7;
const NER_BOUNDS = [
  [21.5, 87.5],
  [29.5, 97.5],
];
const MIN_ZOOM = 6;

// Auto-fits the map view to a set of route paths (used in driver mode)
function FitToRoutes({ routeOptions }) {
  const map = useMap();
  useEffect(() => {
    if (!routeOptions || routeOptions.length === 0) return;
    const allPoints = routeOptions.flatMap((r) => r.coordinates);
    if (allPoints.length > 0) {
      map.fitBounds(allPoints, { padding: [40, 40] });
    }
  }, [routeOptions, map]);
  return null;
}

function MapView({ height = "h-96", mode = "region", routeOptions = [], selectedRouteId = null, vehiclePosition = null, vehicleLabel = null }) {
  const isDriverMode = mode === "driver";
  const { vehicles: liveVehicles } = useVehicles();

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

        {isDriverMode ? (
          <>
            <FitToRoutes routeOptions={routeOptions} />

            {/* Only this vehicle's route options — non-selected ones dimmed */}
            {routeOptions.map((option) => {
              const isSelected = option.id === selectedRouteId;
              return (
                <Polyline
                  key={option.id}
                  positions={option.coordinates}
                  pathOptions={{
                    color: isSelected ? (ROUTE_RISK_COLORS[option.riskLevel] || "#1d4ed8") : "#94a3b8",
                    weight: isSelected ? 6 : 3,
                    opacity: isSelected ? 0.95 : 0.45,
                    dashArray: isSelected ? null : "6 6",
                  }}
                >
                  <Popup>
                    <strong>{option.roadName}</strong>
                    <br />
                    Risk: {option.riskLevel} ({option.riskScore}/100)
                    <br />
                    {isSelected ? "Currently selected" : "Not selected"}
                  </Popup>
                </Polyline>
              );
            })}

            {/* Only this vehicle's marker */}
            {vehiclePosition && (
              <CircleMarker
                center={vehiclePosition}
                radius={8}
                pathOptions={{ color: "white", weight: 2, fillColor: "#1d4ed8", fillOpacity: 1 }}
              >
                <Popup>{vehicleLabel || "Your vehicle"}</Popup>
              </CircleMarker>
            )}
          </>
        ) : (
          <>
            {/* Region mode: all roads */}
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

            {/* Region mode: all vehicles */}
            {liveVehicles.map((v) => (
              <CircleMarker
                key={v.id}
                center={v.coordinates}
                radius={7}
                pathOptions={{ color: "white", weight: 2, fillColor: "#1d4ed8", fillOpacity: 1 }}
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
          </>
        )}
      </MapContainer>

      {/* legend */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white border border-slate-200 rounded-sm px-3 py-2 text-xs space-y-1 shadow-sm">
        {isDriverMode ? (
          <>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded-full bg-blue-600"></span>
              Selected Route
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded-full bg-slate-400" style={{ opacity: 0.5 }}></span>
              Other Options
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-700"></span>
              Your Vehicle
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      <div className="absolute top-3 right-3 z-[1000] bg-slate-800/80 text-white text-[10px] px-2 py-1 rounded-sm">
        {isDriverMode ? "Live map · your assigned routes" : "Live map · mock road/vehicle data"}
      </div>
    </div>
  );
}

export default MapView;