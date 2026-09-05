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
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [commodity, setCommodity] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!vehicleId.trim() || !password.trim() || !origin || !destination || !commodity.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (origin === destination) {
      setError("Origin and destination must be different.");
      return;
    }

    const credentialAdded = registerDriverCredential(vehicleId.trim(), password.trim());
    if (!credentialAdded) {
      setError(`Vehicle ID "${vehicleId}" is already registered.`);
      return;
    }

    const originLoc = knownLocations.find((l) => l.name === origin);

    addVehicle({
      id: vehicleId.trim(),
      origin,
      destination,
      currentLocation: origin,
      coordinates: originLoc ? originLoc.coordinates : [26.1, 92.0],
      commodity: commodity.trim(),
      status: "on_route",
      delayMinutes: 0,
    });

    setSuccess(true);
    setVehicleId("");
    setPassword("");
    setOrigin("");
    setDestination("");
    setCommodity("");
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Register Vehicle</h1>
        <p className="text-sm text-slate-500 mt-1">
          Onboard a new vehicle and issue supplier login credentials
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Origin</label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full mt-1 border border-slate-300 rounded-sm px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              {knownLocations.map((loc) => (
                <option key={loc.name} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Destination</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full mt-1 border border-slate-300 rounded-sm px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              {knownLocations.map((loc) => (
                <option key={loc.name} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>
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

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-green-600 flex items-center gap-1.5">
            <CheckCircle2 size={16} />
            Vehicle registered successfully. Driver can now log in.
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