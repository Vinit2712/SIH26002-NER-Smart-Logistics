import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import RouteCard from "../components/RouteCard";
import { getRoutes } from "../services/api";

function RoutesPage() {
  const [allRoutes, setAllRoutes] = useState([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const r = await getRoutes();
      setAllRoutes(r);
      setLoading(false);
      // default to the first route so the page isn't empty on load
      if (r.length > 0) {
        setOrigin(r[0].origin);
        setDestination(r[0].destination);
        setSelectedRoute(r[0]);
      }
    }
    loadData();
  }, []);

  const origins = [...new Set(allRoutes.map((r) => r.origin))];
  const destinations = [...new Set(allRoutes.map((r) => r.destination))];

  function handleFindRoute() {
    const match = allRoutes.find(
      (r) => r.origin === origin && r.destination === destination
    );
    setSelectedRoute(match || null);
  }

  if (loading) {
    return <p className="text-slate-500 text-sm">Loading route intelligence...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Route Intelligence</h1>
        <p className="text-sm text-slate-500 mt-1">
          AI-recommended routing based on live risk conditions
        </p>
      </div>

      {/* Origin / Destination selector */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        <div className="flex-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Origin</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full mt-1 border border-slate-300 rounded-sm px-3 py-2 text-sm text-slate-700"
          >
            {origins.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <ArrowRight className="hidden sm:block text-slate-400 mb-2" size={18} />

        <div className="flex-1">
          <label className="text-xs font-medium text-slate-500 uppercase">Destination</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full mt-1 border border-slate-300 rounded-sm px-3 py-2 text-sm text-slate-700"
          >
            {destinations.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleFindRoute}
          className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2 rounded-sm"
        >
          Find Route
        </button>
      </div>

      {/* Route comparison */}
      {selectedRoute ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RouteCard title="Recommended Route" route={selectedRoute.recommended} variant="recommended" />
          <RouteCard title="Alternative Route" route={selectedRoute.alternative} variant="alternative" />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-sm p-6 text-center text-sm text-slate-400">
          No route data available for this origin/destination pair yet.
        </div>
      )}
    </div>
  );
}

export default RoutesPage;