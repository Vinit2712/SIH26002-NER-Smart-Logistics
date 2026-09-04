// A small colored dot + label, used for vehicle/delivery status
// Accepts: "on_route", "delayed", "delivered", "at_risk", "stopped"

const DOT_COLORS = {
  on_route: "bg-blue-500",
  delayed: "bg-yellow-500",
  delivered: "bg-green-500",
  at_risk: "bg-orange-500",
  stopped: "bg-red-500",
};

const LABELS = {
  on_route: "On Route",
  delayed: "Delayed",
  delivered: "Delivered",
  at_risk: "At Risk",
  stopped: "Stopped",
};

function StatusIndicator({ status }) {
  const dotColor = DOT_COLORS[status] || "bg-slate-400";
  const label = LABELS[status] || status;

  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-700">
      <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
      {label}
    </span>
  );
}

export default StatusIndicator;