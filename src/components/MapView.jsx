import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import { roads as mockRoads } from "../mockData/roads";
import { useVehicles } from "../context/VehiclesContext";
import { smoothPath } from "../utils/geo";
import { fetchRoadPath } from "../services/routing";

// ---- GIS MAP LAYER ----
// Two modes:
// "region" (default) — used on Admin Dashboard / Map page: shows ALL roads + ALL vehicles.
// "driver" — used on Supplier Dashboard: shows ONLY this vehicle's route options
//            (selected route highlighted, others dimmed), and only this vehicle's marker.
//
// Route/road lines are fetched from OSRM's free routing service so they
// follow real roads. If that request fails (offline, rate-limited), we
// fall back to a smoothed straight-line approximation.

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

// Wraps a road/route's endpoint coordinates, fetches a real road path
// between them, and renders it as a Polyline. Falls back to a smoothed
// straight-line path if the road-routing request fails.
function RoadFollowingLine({ coordinates, pathOptions, children }) {
  const [resolvedPath, setResolvedPath] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function resolvePath() {
      // For multi-point paths, fetch road segments between each consecutive pair
      const segments = [];
      for (let i = 0; i < coordinates.length - 1; i++) {
        const segment = await fetchRoadPath(coordinates[i], coordinates[i + 1]);
        if (!segment) {
          if (!cancelled) setResolvedPath(smoothPath(coordinates));
          return;
        }
        segments.push(segment);
      }
      if (!cancelled) setResolvedPath(segments.flat());
    }
    resolvePath();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(coordinates)]);

  if (!resolvedPath) return null; // wait for the road path before drawing

  return (
    <Polyline positions={resolvedPath} pathOptions={pathOptions}>
      {children}
    </Polyline>
  );
}

function MapView({ height = "h-96", mode = "region", routeOptions = [], selectedRouteId = null, landslideEvents = [], vehiclePosition = null, vehicleLabel = null }) {
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

            {routeOptions.map((option) => {
              const isSelected = option.id === selectedRouteId;
              return (
                <RoadFollowingLine
                  key={option.id}
                  coordinates={option.coordinates}
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
                </RoadFollowingLine>
              );
            })}

            {vehiclePosition && (
              <CircleMarker
                center={vehiclePosition}
                radius={8}
                pathOptions={{ color: "white", weight: 2, fillColor: "#1d4ed8", fillOpacity: 1 }}
              >
                <Popup>{vehicleLabel || "Your vehicle"}</Popup>
              </CircleMarker>
            )}

            {landslideEvents.map((event) => (
              <CircleMarker
                key={event.id}
                center={event.coordinates}
                radius={7}
                pathOptions={{ color: "white", weight: 2, fillColor: "#d97706", fillOpacity: 1 }}
              >
                <Popup>
                  <strong>Historical landslide</strong>
                  <br />
                  {event.location}
                  <br />
                  {event.date} · {event.trigger}
                  <br />
                  {event.distanceFromRouteKm.toFixed(1)} km from selected route
                </Popup>
              </CircleMarker>
            ))}
          </>
        ) : (
          <>
            {mockRoads.map((road) => (
              <RoadFollowingLine
                key={road.id}
                coordinates={road.coordinates}
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
              </RoadFollowingLine>
            ))}

            {liveVehicles.filter((v) => v.coordinates).map((v) => (
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
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-600"></span>
              Historical Landslide
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
