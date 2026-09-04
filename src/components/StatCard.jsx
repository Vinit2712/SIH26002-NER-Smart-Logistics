// A single summary metric card for the dashboard top row.
// Optional `tone` colors the value text: "default" | "success" | "warning" | "danger"

const TONE_STYLES = {
  default: "text-slate-800",
  success: "text-green-600",
  warning: "text-yellow-600",
  danger: "text-red-600",
};

function StatCard({ label, value, icon: Icon, tone = "default" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-sm p-4 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <p className={`text-2xl font-bold mt-1 ${TONE_STYLES[tone]}`}>
          {value}
        </p>
      </div>
      {Icon && (
        <div className="p-2 bg-slate-100 rounded-sm">
          <Icon size={18} className="text-slate-500" />
        </div>
      )}
    </div>
  );
}

export default StatCard;