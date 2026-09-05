import RiskBadge from "./RiskBadge";

// Displays a single route option (recommended or alternative).
// `variant` controls header styling: "recommended" | "alternative"
// `selectable`/`selected`/`onSelect` enable click-to-select behavior (used on Driver Dashboard)

function RouteCard({ title, route, variant = "recommended", selectable = false, selected = false, onSelect }) {
  const headerStyle =
    variant === "recommended"
      ? "bg-slate-800 text-white"
      : "bg-slate-100 text-slate-700";

  return (
    <div
      onClick={selectable ? onSelect : undefined}
      className={`bg-white border rounded-sm overflow-hidden ${
        selectable ? "cursor-pointer transition-all" : ""
      } ${selected ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200"}`}
    >
      <div className={`px-4 py-2.5 flex items-center justify-between ${headerStyle}`}>
        <p className="text-xs font-semibold uppercase tracking-wide">{title}</p>
        {selectable && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
              selected ? "bg-blue-600 text-white" : "bg-white/20 text-inherit"
            }`}
          >
            {selected ? "SELECTED" : "SELECT"}
          </span>
        )}
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
            <div className="flex items-center gap-2">
              <RiskBadge level={route.riskLevel} />
              {typeof route.riskScore === "number" && (
                <span className="text-xs font-semibold text-slate-500">
                  {route.riskScore}/100
                </span>
              )}
            </div>
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
            <p className="text-xs text-slate-400 uppercase mb-1">
              {variant === "recommended" ? "Why This Risk Level" : "Why Recommended"}
            </p>
            <p className="text-sm text-slate-600">{route.reason}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RouteCard;