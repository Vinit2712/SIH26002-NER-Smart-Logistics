import { useEffect, useState } from "react";
import AlertPanel from "../components/AlertPanel";
import { getAlerts } from "../services/api";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const a = await getAlerts();
      setAlerts(a);
      setLoading(false);
    }
    loadData();
  }, []);

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

      <AlertPanel alerts={alerts} />
    </div>
  );
}

export default Alerts;