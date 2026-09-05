import { createContext, useContext, useEffect, useState } from "react";
import { getVehicles } from "../services/api";

const VehiclesContext = createContext(null);

export function VehiclesProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVehicles() {
      const data = await getVehicles();
      setVehicles(data);
      setLoading(false);
    }
    loadVehicles();
  }, []);

  // Updates a single vehicle's fields (e.g. new origin/destination/route/coordinates)
  function updateVehicle(vehicleId, updates) {
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, ...updates } : v))
    );
  }

  // Adds a brand-new vehicle (used when Admin registers one)
  function addVehicle(vehicle) {
    setVehicles((prev) => [...prev, vehicle]);
  }

  return (
    <VehiclesContext.Provider value={{ vehicles, loading, updateVehicle, addVehicle }}>
      {children}
    </VehiclesContext.Provider>
  );
}

export function useVehicles() {
  return useContext(VehiclesContext);
}