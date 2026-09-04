import { NavLink } from "react-router-dom";
import { LayoutDashboard, Map, Route, Truck, AlertTriangle } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/map", label: "Map", icon: Map },
  { to: "/routes", label: "Routes", icon: Route },
  { to: "/logistics", label: "Logistics", icon: Truck },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
];

function Sidebar() {
  return (
    <aside className="w-56 bg-slate-900 text-slate-200 flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-slate-700">
        <h1 className="text-lg font-bold text-white tracking-wide">RISKROUTE</h1>
        <p className="text-[11px] text-slate-400 mt-0.5">NER Logistics Intelligence</p>
      </div>

      <nav className="flex-1 py-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm border-l-2 transition-colors ${
                isActive
                  ? "bg-slate-800 border-blue-500 text-white"
                  : "border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;