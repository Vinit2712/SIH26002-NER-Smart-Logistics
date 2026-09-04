import { useEffect, useState } from "react";
import VehicleTable from "../components/VehicleTable";
import { getVehicles } from "../services/api";

function Logistics() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const v = await getVehicles();
      setVehicles(v);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <p className="text-slate-500 text-sm">Loading logistics data...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Logistics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Live status of all active vehicles across the network
        </p>
      </div>

      <VehicleTable vehicles={vehicles} />
    </div>
  );
}

export default Logistics;