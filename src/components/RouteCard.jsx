import RiskBadge from "./RiskBadge";

// Displays a single route option (recommended or alternative).
// `variant` controls the header styling: "recommended" | "alternative"

function RouteCard({ title, route, variant = "recommended" }) {
  const headerStyle =
    variant === "recommended"
      ? "bg-slate-800 text-white"
      : "bg-slate-100 text-slate-700";

  return (
    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
      <div className={`px-4 py-2.5 ${headerStyle}`}>
        <p className="text-xs font-semibold uppercase tracking-wide">{title}</p>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-lg font-bold text-slate-800">{route.roadName}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-400 uppercase">Distance</p>
            <p className="font-semibold text-slate-700">{route.distanceKm} km</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase">ETA</p>
            <p className="font-semibold text-slate-700">
              {Math.floor(route.etaMinutes / 60)}h {route.etaMinutes % 60}m
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase">Risk Level</p>
            <RiskBadge level={route.riskLevel} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase">Delay</p>
            <p className="font-semibold text-slate-700">
              {route.delayMinutes >= 999 ? "Blocked" : `${route.delayMinutes} min`}
            </p>
          </div>
        </div>

        {route.reason && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-400 uppercase mb-1">Why Recommended</p>
            <p className="text-sm text-slate-600">{route.reason}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RouteCard;