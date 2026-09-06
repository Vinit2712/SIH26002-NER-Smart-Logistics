import { createContext, useContext, useEffect, useState } from "react";
import { getAlerts } from "../services/api";

const AlertsContext = createContext(null);
const STORAGE_KEY = "riskroute_alerts";

function readFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function AlertsProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      const stored = readFromStorage();
      if (stored) {
        setAlerts(stored);
        setLoading(false);
        return;
      }
      const data = await getAlerts();
      setAlerts(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLoading(false);
    }
    loadAlerts();

    function handleStorageChange(e) {
      if (e.key === STORAGE_KEY && e.newValue) {
        setAlerts(JSON.parse(e.newValue));
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  function addAlert({ severity, location, description }) {
    const latest = readFromStorage() || alerts;
    const newAlert = {
      id: `a-${Date.now()}`,
      severity,
      location,
      time: new Date().toISOString(),
      description,
    };
    const updated = [newAlert, ...latest];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setAlerts(updated);
  }

  return (
    <AlertsContext.Provider value={{ alerts, loading, addAlert }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  return useContext(AlertsContext);
}