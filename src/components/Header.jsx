import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <h2 className="text-sm font-semibold text-slate-700">
        Smart Logistics & Accessibility Intelligence Platform
      </h2>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live · North Eastern Region
        </div>
        {user && (
          <>
            <span className="text-xs text-slate-400 border-l border-slate-200 pl-4">
              {user.role === "driver" ? user.vehicleId : user.username}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600"
            >
              <LogOut size={14} />
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;