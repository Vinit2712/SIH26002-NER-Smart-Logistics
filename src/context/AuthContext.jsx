import { createContext, useContext, useState } from "react";
import { driverCredentials as initialDriverCredentials, govtCredentials } from "../mockData/credentials";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [driverCredentials, setDriverCredentials] = useState(initialDriverCredentials);
  // user shape: { role: "driver", vehicleId: "V-101" } or { role: "govt", username: "admin" }

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

  // Called by Admin when registering a new vehicle — issues login credentials for it.
  function registerDriverCredential(vehicleId, password) {
    const exists = driverCredentials.some((d) => d.vehicleId === vehicleId);
    if (exists) return false;
    setDriverCredentials((prev) => [...prev, { vehicleId, password }]);
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