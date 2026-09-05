import { createContext, useContext, useEffect, useState } from "react";
import { getAlerts } from "../services/api";

const AlertsContext = createContext(null);

export function AlertsProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      const data = await getAlerts();
      setAlerts(data);
      setLoading(false);
    }
    loadAlerts();
  }, []);

  // Adds a new alert to the front of the list (e.g. from a driver's emergency button)
  function addAlert({ severity, location, description }) {
    const newAlert = {
      id: `a-${Date.now()}`,
      severity,
      location,
      time: new Date().toISOString(),
      description,
    };
    setAlerts((prev) => [newAlert, ...prev]);
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