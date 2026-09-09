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

function AlertPanel({ alerts, onAcknowledge }) {
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
          {alert.emergencyReport && (
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-sm p-3 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-700">Driver report · {alert.emergencyReport.vehicleId}</span>
                <span className={alert.deliveryStatus === "queued" ? "text-amber-700" : "text-green-700"}>{alert.deliveryStatus === "queued" ? "Queued — no signal" : "Delivered"}</span>
              </div>
              <p>Status: <strong>{alert.emergencyReport.driverStatus}</strong> · Last known: {alert.emergencyReport.lastKnownLocation}</p>
              {alert.emergencyReport.contactNumber && <p>Driver contact: <a className="font-medium text-blue-700" href={`tel:${alert.emergencyReport.contactNumber}`}>{alert.emergencyReport.contactNumber}</a></p>}
              {alert.emergencyReport.routeName && <p>Assigned route: {alert.emergencyReport.routeName}</p>}
              {alert.acknowledgementStatus === "acknowledged" ? <p className="text-green-700 font-medium">Control room acknowledged this report.</p> : <button onClick={() => onAcknowledge?.(alert.id)} className="mt-1 text-xs font-semibold text-blue-700 hover:text-blue-800">Acknowledge and begin response</button>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AlertPanel;
