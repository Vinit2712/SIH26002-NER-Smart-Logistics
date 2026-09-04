import { useEffect, useState } from "react";
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  Clock,
  Bell,
} from "lucide-react";
import StatCard from "../components/StatCard";
import RiskBadge from "../components/RiskBadge";
import StatusIndicator from "../components/StatusIndicator";
import MapView from "../components/MapView";
import { getDistricts, getRoads, getVehicles, getAlerts } from "../services/api";

function Dashboard() {
  const [districts, setDistricts] = useState([]);
  const [roads, setRoads] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [d, r, v, a] = await Promise.all([
        getDistricts(),
        getRoads(),
        getVehicles(),
        getAlerts(),
      ]);
      setDistricts(d);
      setRoads(r);
      setVehicles(v);
      setAlerts(a);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <p className="text-slate-500 text-sm">Loading dashboard...</p>;
  }

  const accessibleRoads = roads.filter((r) => r.status === "accessible").length;
  const atRiskRoads = roads.filter((r) => r.status === "at_risk").length;
  const inaccessibleRoads = roads.filter((r) => r.status === "inaccessible").length;
  const delayedVehicles = vehicles.filter(
    (v) => v.status === "delayed" || v.status === "at_risk"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time overview of the North Eastern Region logistics network
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatCard label="Districts Monitored" value={districts.length} icon={MapPin} />
        <StatCard label="Accessible Routes" value={accessibleRoads} icon={CheckCircle2} tone="success" />
        <StatCard label="At-Risk Routes" value={atRiskRoads} icon={AlertTriangle} tone="warning" />
        <StatCard label="Inaccessible Routes" value={inaccessibleRoads} icon={XCircle} tone="danger" />
        <StatCard label="Active Vehicles" value={vehicles.length} icon={Truck} />
        <StatCard label="Delayed Deliveries" value={delayedVehicles} icon={Clock} tone="warning" />
        <StatCard label="Active Alerts" value={alerts.length} icon={Bell} tone="danger" />
      </div>

      {/* Live risk map + side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live risk / map view */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-sm p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Live Risk Map</h2>
          <MapView height="h-[380px]" />
        </div>

        <div className="flex flex-col gap-6">
          {/* Current important alerts */}
          <div className="bg-white border border-slate-200 rounded-sm p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Important Alerts</h2>
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="border-l-2 border-red-400 pl-3">
                  <div className="flex items-center gap-2">
                    <RiskBadge level={alert.severity} />
                    <span className="text-xs text-slate-400">{alert.location}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1">{alert.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics status */}
          <div className="bg-white border border-slate-200 rounded-sm p-4 flex-1">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Logistics Status</h2>
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {vehicles.slice(0, 5).map((v) => (
                <div key={v.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-slate-700">{v.id}</span>
                    <span className="text-slate-400 ml-2">
                      {v.origin} → {v.destination}
                    </span>
                  </div>
                  <StatusIndicator status={v.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;