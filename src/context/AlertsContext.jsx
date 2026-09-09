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
    function sendQueuedReports() {
      const latest = readFromStorage() || [];
      const updated = latest.map((alert) => alert.deliveryStatus === "queued" ? { ...alert, deliveryStatus: "sent", deliveredAt: new Date().toISOString() } : alert);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setAlerts(updated);
    }
    window.addEventListener("online", sendQueuedReports);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("online", sendQueuedReports);
    };
  }, []);

  function addAlert({ severity, location, description, emergencyReport = null }) {
    const latest = readFromStorage() || alerts;
    const newAlert = {
      id: `a-${Date.now()}`,
      severity,
      location,
      time: new Date().toISOString(),
      description,
      emergencyReport,
      deliveryStatus: emergencyReport ? (navigator.onLine ? "sent" : "queued") : "sent",
      acknowledgementStatus: emergencyReport ? "awaiting" : null,
    };
    const updated = [newAlert, ...latest];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setAlerts(updated);
  }

  function acknowledgeAlert(alertId) {
    const latest = readFromStorage() || alerts;
    const updated = latest.map((alert) => alert.id === alertId ? { ...alert, acknowledgementStatus: "acknowledged", acknowledgedAt: new Date().toISOString() } : alert);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setAlerts(updated);
  }

  return (
      <AlertsContext.Provider value={{ alerts, loading, addAlert, acknowledgeAlert }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  return useContext(AlertsContext);
}
