import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useVehicles } from "../context/VehiclesContext";
import { knownLocations } from "../mockData/locations";

function RegisterVehicle() {
  const { registerDriverCredential } = useAuth();
  const { addVehicle } = useVehicles();

  const [vehicleId, setVehicleId] = useState("");
  const [password, setPassword] = useState("");
  const [commodity, setCommodity] = useState("");
  const [routeAssignmentMode, setRouteAssignmentMode] = useState("admin");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!vehicleId.trim() || !password.trim() || !commodity.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (routeAssignmentMode === "admin" && (!origin || !destination || origin === destination)) {
      setError("Choose different starting and final destinations for this assignment.");
      return;
    }

    const credentialAdded = registerDriverCredential(vehicleId.trim(), password.trim());
    if (!credentialAdded) {
      setError(`Vehicle ID "${vehicleId}" is already registered.`);
      return;
    }

    addVehicle({
      id: vehicleId.trim(),
      origin: routeAssignmentMode === "admin" ? origin : null,
      destination: routeAssignmentMode === "admin" ? destination : null,
      routeAssignmentMode,
      currentLocation: routeAssignmentMode === "admin" ? origin : "Not yet assigned",
      coordinates: null,
      commodity: commodity.trim(),
      status: "on_route",
      delayMinutes: 0,
    });

    setSuccess(true);
    setVehicleId("");
    setPassword("");
    setCommodity("");
    setOrigin("");
    setDestination("");
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Register Vehicle</h1>
        <p className="text-sm text-slate-500 mt-1">
          Onboard a new vehicle, issue driver credentials, and decide who enters the journey endpoints.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-sm p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase">Vehicle ID</label>
          <input
            type="text"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            placeholder="e.g. V-107"
            className="w-full mt-1 border border-slate-300 rounded-sm px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 uppercase">Login Password</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password for this vehicle's driver login"
            className="w-full mt-1 border border-slate-300 rounded-sm px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 uppercase">Commodity</label>
          <input
            type="text"
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            placeholder="e.g. Medical Supplies"
            className="w-full mt-1 border border-slate-300 rounded-sm px-3 py-2 text-sm"
          />
        </div>

        <fieldset>
          <legend className="text-xs font-medium text-slate-500 uppercase">Who sets the journey?</legend>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className={`border rounded-sm p-3 cursor-pointer ${routeAssignmentMode === "admin" ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}>
              <input type="radio" name="route-assignment" value="admin" checked={routeAssignmentMode === "admin"} onChange={() => setRouteAssignmentMode("admin")} className="mr-2" />
              <span className="text-sm font-medium text-slate-700">Admin assigns route</span>
              <span className="block text-xs text-slate-500 mt-1 ml-5">Driver can view, but not change endpoints.</span>
            </label>
            <label className={`border rounded-sm p-3 cursor-pointer ${routeAssignmentMode === "driver" ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}>
              <input type="radio" name="route-assignment" value="driver" checked={routeAssignmentMode === "driver"} onChange={() => setRouteAssignmentMode("driver")} className="mr-2" />
              <span className="text-sm font-medium text-slate-700">Driver enters route</span>
              <span className="block text-xs text-slate-500 mt-1 ml-5">Driver selects endpoints after login.</span>
            </label>
          </div>
        </fieldset>

        {routeAssignmentMode === "admin" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs font-medium text-slate-500 uppercase">Starting destination
              <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full mt-1 border border-slate-300 rounded-sm px-3 py-2 text-sm text-slate-700"><option value="">Select start</option>{knownLocations.map((loc) => <option key={loc.name} value={loc.name}>{loc.name}</option>)}</select>
            </label>
            <label className="text-xs font-medium text-slate-500 uppercase">Final destination
              <select value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full mt-1 border border-slate-300 rounded-sm px-3 py-2 text-sm text-slate-700"><option value="">Select end</option>{knownLocations.map((loc) => <option key={loc.name} value={loc.name}>{loc.name}</option>)}</select>
            </label>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-green-600 flex items-center gap-1.5">
            <CheckCircle2 size={16} />
            Vehicle registered successfully. {routeAssignmentMode === "admin" ? "The assigned endpoints are ready for the driver." : "The driver can choose endpoints after logging in."}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-2.5 rounded-sm"
        >
          Register Vehicle
        </button>
      </form>
    </div>
  );
}

export default RegisterVehicle;
