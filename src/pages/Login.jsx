import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [role, setRole] = useState("driver"); // "driver" | "govt"
  const [idOrUsername, setIdOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { loginDriver, loginGovt } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (role === "driver") {
      const success = loginDriver(idOrUsername.trim(), password);
      if (success) {
        navigate("/driver");
      } else {
        setError("Invalid Vehicle ID or password.");
      }
    } else {
      const success = loginGovt(idOrUsername.trim(), password);
      if (success) {
        navigate("/");
      } else {
        setError("Invalid username or password.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-sm p-6">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-slate-800 tracking-wide">RISKROUTE</h1>
          <p className="text-xs text-slate-500 mt-1">NER Logistics Intelligence</p>
        </div>

        {/* Role tabs */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => { setRole("driver"); setError(""); }}
            className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-sm border ${
              role === "driver"
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-500 border-slate-300"
            }`}
          >
            <Truck size={16} />
            Supplier
          </button>
          <button
            type="button"
            onClick={() => { setRole("govt"); setError(""); }}
            className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-sm border ${
              role === "govt"
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-500 border-slate-300"
            }`}
          >
            <ShieldCheck size={16} />
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">
              {role === "driver" ? "Vehicle ID" : "Username"}
            </label>
            <input
              type="text"
              value={idOrUsername}
              onChange={(e) => setIdOrUsername(e.target.value)}
              placeholder={role === "driver" ? "e.g. V-101" : "e.g. admin"}
              className="w-full mt-1 border border-slate-300 rounded-sm px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 border border-slate-300 rounded-sm px-3 py-2 text-sm"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium py-2.5 rounded-sm"
          >
            Log In
          </button>
        </form>

        {role === "driver" && (
          <p className="text-xs text-slate-400 mt-4 text-center">
            Demo IDs: V-101 to V-106 · Password: driver123
          </p>
        )}
        {role === "govt" && (
          <p className="text-xs text-slate-400 mt-4 text-center">
            Demo login: admin / admin123
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;