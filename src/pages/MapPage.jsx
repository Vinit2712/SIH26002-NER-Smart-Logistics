import { useEffect, useState } from "react";
import MapView from "../components/MapView";
import RiskBadge from "../components/RiskBadge";
import { getRoads } from "../services/api";

function MapPage() {
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const r = await getRoads();
      setRoads(r);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <p className="text-slate-500 text-sm">Loading map...</p>;
  }

  const accessible = roads.filter((r) => r.status === "accessible");
  const atRisk = roads.filter((r) => r.status === "at_risk");
  const inaccessible = roads.filter((r) => r.status === "inaccessible");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Live Risk Map</h1>
        <p className="text-sm text-slate-500 mt-1">
          Road network status across the North Eastern Region
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Large map */}
        <div className="lg:col-span-3">
          <MapView height="h-[560px]" />
        </div>

        {/* Side panel: road status breakdown */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-sm p-4">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Road Status ({roads.length} total)
            </h2>
            <div className="space-y-3 max-h-[480px] overflow-y-auto">
              {[...inaccessible, ...atRisk, ...accessible].map((road) => (
                <div key={road.id} className="border border-slate-100 rounded-sm p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{road.name}</span>
                    <RiskBadge level={road.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {road.from} → {road.to}
                  </p>
                  {road.riskReason && (
                    <p className="text-xs text-slate-500 mt-1">{road.riskReason}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapPage;