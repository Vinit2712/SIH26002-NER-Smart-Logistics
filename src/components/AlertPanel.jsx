import RiskBadge from "./RiskBadge";

function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const BORDER_COLORS = {
  critical: "border-red-400",
  high: "border-orange-400",
  medium: "border-yellow-400",
};

function AlertPanel({ alerts }) {
  return (
    <div className="bg-white border border-slate-200 rounded-sm divide-y divide-slate-100">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 border-l-4 ${BORDER_COLORS[alert.severity] || "border-slate-300"}`}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <RiskBadge level={alert.severity} />
              <span className="text-sm font-medium text-slate-700">{alert.location}</span>
            </div>
            <span className="text-xs text-slate-400">{formatTime(alert.time)}</span>
          </div>
          <p className="text-sm text-slate-600 mt-2">{alert.description}</p>
        </div>
      ))}
    </div>
  );
}

export default AlertPanel;