// Displays a small colored badge for risk/status level.
// Accepts: "accessible", "low", "at_risk", "medium", "high", "inaccessible", "critical"

const STYLES = {
  accessible: "bg-green-100 text-green-800 border-green-300",
  low: "bg-green-100 text-green-800 border-green-300",
  at_risk: "bg-yellow-100 text-yellow-800 border-yellow-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  inaccessible: "bg-red-100 text-red-800 border-red-300",
  critical: "bg-red-100 text-red-800 border-red-300",
};

const LABELS = {
  accessible: "Accessible",
  low: "Low Risk",
  at_risk: "At Risk",
  medium: "Medium Risk",
  high: "High Risk",
  inaccessible: "Inaccessible",
  critical: "Critical",
};

function RiskBadge({ level }) {
  const style = STYLES[level] || "bg-slate-100 text-slate-800 border-slate-300";
  const label = LABELS[level] || level;

  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-semibold border rounded-sm ${style}`}
    >
      {label}
    </span>
  );
}

export default RiskBadge;