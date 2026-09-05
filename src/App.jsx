import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MapPage from "./pages/MapPage";
import RoutesPage from "./pages/Routes";
import Logistics from "./pages/Logistics";
import Alerts from "./pages/Alerts";
import DriverDashboard from "./pages/DriverDashboard";
import RegisterVehicle from "./pages/RegisterVehicle";

// Shared layout for the Government Official dashboard (sidebar + header + page)
function GovtLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

// Simpler layout for the Driver dashboard (header only, no sidebar — single page)
function DriverLayout({ children }) {
  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <Header />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Government Official routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRole="govt">
              <GovtLayout><Dashboard /></GovtLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute allowedRole="govt">
              <GovtLayout><MapPage /></GovtLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/routes"
          element={
            <ProtectedRoute allowedRole="govt">
              <GovtLayout><RoutesPage /></GovtLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/logistics"
          element={
            <ProtectedRoute allowedRole="govt">
              <GovtLayout><Logistics /></GovtLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute allowedRole="govt">
              <GovtLayout><Alerts /></GovtLayout>
            </ProtectedRoute>
          }
        />
                <Route
          path="/register-vehicle"
          element={
            <ProtectedRoute allowedRole="govt">
              <GovtLayout><RegisterVehicle /></GovtLayout>
            </ProtectedRoute>
          }
        />

        {/* Driver route */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute allowedRole="driver">
              <DriverLayout><DriverDashboard /></DriverLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;