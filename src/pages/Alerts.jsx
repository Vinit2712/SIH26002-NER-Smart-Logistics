import AlertPanel from "../components/AlertPanel";
import { useAlerts } from "../context/AlertsContext";

function Alerts() {
  const { alerts, loading, acknowledgeAlert } = useAlerts();

  if (loading) {
    return <p className="text-slate-500 text-sm">Loading alerts...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Alerts</h1>
        <p className="text-sm text-slate-500 mt-1">
          Active alerts requiring attention across the region
        </p>
      </div>

      <AlertPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
    </div>
  );
}

export default Alerts;
