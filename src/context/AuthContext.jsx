import { createContext, useContext, useState, useEffect } from "react";
import { driverCredentials as initialDriverCredentials, govtCredentials } from "../mockData/credentials";

const AuthContext = createContext(null);
const STORAGE_KEY = "riskroute_driver_credentials";

function loadStoredCredentials() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialDriverCredentials;
  } catch {
    return initialDriverCredentials;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [driverCredentials, setDriverCredentials] = useState(loadStoredCredentials);

  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === STORAGE_KEY && e.newValue) {
        setDriverCredentials(JSON.parse(e.newValue));
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  function loginDriver(vehicleId, password) {
    const match = driverCredentials.find(
      (d) => d.vehicleId === vehicleId && d.password === password
    );
    if (match) {
      setUser({ role: "driver", vehicleId: match.vehicleId });
      return true;
    }
    return false;
  }

  function loginGovt(username, password) {
    const match = govtCredentials.find(
      (g) => g.username === username && g.password === password
    );
    if (match) {
      setUser({ role: "govt", username: match.username });
      return true;
    }
    return false;
  }

  function logout() {
    setUser(null);
  }

  function registerDriverCredential(vehicleId, password) {
    const exists = driverCredentials.some((d) => d.vehicleId === vehicleId);
    if (exists) return false;
    const updated = [...driverCredentials, { vehicleId, password }];
    setDriverCredentials(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  }

  return (
    <AuthContext.Provider
      value={{ user, loginDriver, loginGovt, logout, driverCredentials, registerDriverCredential }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}