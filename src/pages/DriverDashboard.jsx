import { useEffect, useState } from "react";
import { AlertOctagon, CheckCircle2, Download, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAlerts } from "../context/AlertsContext";
import { useVehicles } from "../context/VehiclesContext";
import { getRouteForPair } from "../services/api";
import { knownLocations } from "../mockData/locations";
import RouteCard from "../components/RouteCard";
import MapView from "../components/MapView";
import LandslideHistory from "../components/LandslideHistory";
import { getLandslidesNearRoute } from "../mockData/landslides";
import EmergencyReportModal from "../components/EmergencyReportModal";

function DriverDashboard() {
  const { user } = useAuth();
  const { addAlert } = useAlerts();
  const { vehicles, updateVehicle } = useVehicles();

  const [loading, setLoading] = useState(true);
  const [alertSent, setAlertSent] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [activeRouteSet, setActiveRouteSet] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  const myVehicle = vehicles.find((v) => v.id === user.vehicleId);
  const endpointsLocked = myVehicle?.routeAssignmentMode === "admin";

  useEffect(() => {
    async function loadDefaultRoute() {
      if (myVehicle && myVehicle.origin && myVehicle.destination) {
        const existing = await getRouteForPair(myVehicle.origin, myVehicle.destination);
        if (existing) {
          setOrigin(myVehicle.origin);
          setDestination(myVehicle.destination);
          setActiveRouteSet(existing);
          setSelectedRouteId(existing.recommended.id);
        }
      }
      setLoading(false);
    }
    loadDefaultRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFindRoute() {
    if (endpointsLocked) return;
    const result = await getRouteForPair(origin, destination);
    if (result) {
      setActiveRouteSet(result);
      setSelectedRouteId(result.recommended.id);
    } else {
      setActiveRouteSet(null);
      setSelectedRouteId(null);
    }
  }
  function handleSelectRoute(option) {
    console.log("Route card clicked. user.vehicleId:", user.vehicleId, "origin:", origin, "destination:", destination);
    setSelectedRouteId(option.id);
    updateVehicle(user.vehicleId, {
      origin,
      destination,
      currentLocation: origin,
      coordinates: option.coordinates[0],
      status: option.riskLevel === "critical" || option.riskLevel === "high" ? "at_risk" : "on_route",
      delayMinutes: option.delayMinutes,
    });
    console.log("updateVehicle called");
  }

  function handleEmergencyReport(report) {
    addAlert({
      severity: "critical",
      location: `Vehicle ${user.vehicleId}${activeRouteSet ? ` — ${origin} → ${destination}` : ""}`,
      description: `${report.type}: ${report.driverStatus}${report.details ? ` — ${report.details}` : ""}`,
      emergencyReport: {
        ...report,
        vehicleId: user.vehicleId,
        routeName: selectedRoute?.roadName || null,
        origin,
        destination,
        coordinates: myVehicle?.coordinates || null,
        lastKnownLocation: myVehicle?.currentLocation || origin,
        contactNumber: user.contactNumber,
      },
    });
    setEmergencyOpen(false);
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 4000);
  }

  function handleDownload() {
    window.print();
  }

  if (loading) {
    return <p className="text-slate-500 text-sm">Loading your dashboard...</p>;
  }

  const routeOptions = activeRouteSet
    ? [activeRouteSet.recommended, activeRouteSet.alternative, activeRouteSet.alternative2].filter(Boolean)
    : [];
  const selectedRoute = routeOptions.find((route) => route.id === selectedRouteId);
  const landslideEvents = selectedRoute ? getLandslidesNearRoute(selectedRoute.coordinates) : [];

  return (
    <div className="space-y-6 printable-area">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome, {user.vehicleId}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Choose your route and monitor live risk status
          </p>
        </div>

        {activeRouteSet && (
          <button
            onClick={handleDownload}
            className="print:hidden flex items-center gap-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-sm px-3 py-2 hover:bg-slate-50"
          >
            <Download size={16} />
            Download Route Details
          </button>
        )}
      </div>

      {/* Origin / Destination selector */}
      <div className="print:hidden bg-white border border-slate-200 rounded-sm p-4 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Origin</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            disabled={endpointsLocked}
            className="w-full mt-1 border border-slate-300 rounded-sm px-3 py-2 text-sm text-slate-700"
          >
            <option value="">Select origin</option>
            {knownLocations.map((loc) => (
              <option key={loc.name} value={loc.name}>{loc.name}</option>
            ))}
          </select>
        </div>

        <ArrowRight className="hidden sm:block text-slate-400 mb-2" size={18} />

        <div className="flex-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Destination</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            disabled={endpointsLocked}
            className="w-full mt-1 border border-slate-300 rounded-sm px-3 py-2 text-sm text-slate-700"
          >
            <option value="">Select destination</option>
            {knownLocations.map((loc) => (
              <option key={loc.name} value={loc.name}>{loc.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleFindRoute}
          disabled={endpointsLocked || !origin || !destination || origin === destination}
          className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white text-sm font-medium px-5 py-2 rounded-sm"
        >
          {endpointsLocked ? "Admin Assigned" : "Find Route"}
        </button>
      </div>

      {!activeRouteSet && (
        <div className="bg-white border border-slate-200 rounded-sm p-6 text-center text-sm text-slate-400">
          Select an origin and destination above to see available routes.
        </div>
      )}

      {activeRouteSet && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: route options + emergency button */}
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1 print:max-h-none print:overflow-visible">
              <RouteCard
                title="Recommended Route"
                route={activeRouteSet.recommended}
                variant="recommended"
                selectable
                selected={selectedRouteId === activeRouteSet.recommended.id}
                onSelect={() => handleSelectRoute(activeRouteSet.recommended)}
              />
              <RouteCard
                title="Alternative Route 1"
                route={activeRouteSet.alternative}
                variant="alternative"
                selectable
                selected={selectedRouteId === activeRouteSet.alternative.id}
                onSelect={() => handleSelectRoute(activeRouteSet.alternative)}
              />
              {activeRouteSet.alternative2 && (
                <RouteCard
                  title="Alternative Route 2"
                  route={activeRouteSet.alternative2}
                  variant="alternative"
                  selectable
                  selected={selectedRouteId === activeRouteSet.alternative2.id}
                  onSelect={() => handleSelectRoute(activeRouteSet.alternative2)}
                />
              )}
            </div>

            {/* Emergency button */}
            <div className="bg-white border border-slate-200 rounded-sm p-4 print:hidden">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Emergency</h2>
              <p className="text-sm text-slate-500 mb-3">
                If you are facing a breakdown, accident, or blocked road, alert government officials immediately.
              </p>
              <button
                onClick={() => setEmergencyOpen(true)}
                disabled={alertSent}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-sm text-sm font-semibold text-white ${
                  alertSent ? "bg-green-600" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {alertSent ? (
                  <>
                    <CheckCircle2 size={18} />
                    Alert Sent
                  </>
                ) : (
                  <>
                    <AlertOctagon size={18} />
                    Send Emergency Alert
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: route map and incident history */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-sm p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Live Route Map</h2>
              <MapView
                height="h-[480px]"
                mode="driver"
                routeOptions={routeOptions}
                selectedRouteId={selectedRouteId}
                landslideEvents={landslideEvents}
                vehiclePosition={myVehicle?.coordinates}
                vehicleLabel={user.vehicleId}
              />
            </div>
            <LandslideHistory events={landslideEvents} routeName={selectedRoute?.roadName} currentRiskScore={selectedRoute?.riskScore} />
          </div>
        </div>
      )}
      {emergencyOpen && (
        <EmergencyReportModal
          vehicle={myVehicle}
          route={selectedRoute}
          onClose={() => setEmergencyOpen(false)}
          onSubmit={handleEmergencyReport}
        />
      )}
    </div>
  );
}

export default DriverDashboard;
