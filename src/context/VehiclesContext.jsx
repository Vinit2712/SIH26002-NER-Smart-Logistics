import { createContext, useContext, useEffect, useState } from "react";
import { getVehicles } from "../services/api";

const VehiclesContext = createContext(null);
const STORAGE_KEY = "riskroute_vehicles";

function readFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function VehiclesProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVehicles() {
      const stored = readFromStorage();
      if (stored) {
        setVehicles(stored);
        setLoading(false);
        return;
      }
      const data = await getVehicles();
      setVehicles(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLoading(false);
    }
    loadVehicles();

    function handleStorageChange(e) {
      if (e.key === STORAGE_KEY && e.newValue) {
        setVehicles(JSON.parse(e.newValue));
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Always reads the LATEST data from localStorage first, so a write from
  // another tab isn't accidentally overwritten by this tab's older copy.
  function updateVehicle(vehicleId, updates) {
    const latest = readFromStorage() || vehicles;
    const updated = latest.map((v) => (v.id === vehicleId ? { ...v, ...updates } : v));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setVehicles(updated);
  }

  function addVehicle(vehicle) {
    const latest = readFromStorage() || vehicles;
    const updated = [...latest, vehicle];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setVehicles(updated);
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