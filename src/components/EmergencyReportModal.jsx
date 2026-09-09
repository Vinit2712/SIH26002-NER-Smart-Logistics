import { useState } from "react";
import { AlertTriangle, MapPin, Radio, X } from "lucide-react";

const EMERGENCY_TYPES = ["Landslide / road blocked", "Accident", "Vehicle breakdown", "Medical emergency", "Security threat", "Other"];
const DRIVER_STATUSES = ["I am safe", "Vehicle stuck", "Need rescue", "Need alternate route"];

function EmergencyReportModal({ vehicle, route, onClose, onSubmit }) {
  const [type, setType] = useState(EMERGENCY_TYPES[0]);
  const [driverStatus, setDriverStatus] = useState(DRIVER_STATUSES[0]);
  const [details, setDetails] = useState("");
  const isOnline = navigator.onLine;

  function submit(event) {
    event.preventDefault();
    onSubmit({ type, driverStatus, details, isOnline });
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950/45 flex items-end sm:items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-lg bg-white rounded-sm shadow-xl overflow-hidden">
        <div className="bg-red-700 text-white px-5 py-4 flex items-start justify-between gap-3">
          <div className="flex gap-3"><AlertTriangle className="shrink-0" /><div><h2 className="font-semibold">Send emergency report</h2><p className="text-xs text-red-100 mt-0.5">Your location and route details will be included automatically.</p></div></div>
          <button type="button" onClick={onClose} aria-label="Close emergency form"><X size={19} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className={`text-xs rounded-sm px-3 py-2 flex items-center gap-2 ${isOnline ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}`}>
            <Radio size={14} />
            {isOnline ? "Connection available — report will reach the control room now." : "No signal — report is saved securely and will send automatically when connection returns."}
          </div>
          <label className="block text-sm font-medium text-slate-700">What happened?<select value={type} onChange={(event) => setType(event.target.value)} className="mt-1.5 w-full border border-slate-300 rounded-sm px-3 py-2 text-sm font-normal"><>{EMERGENCY_TYPES.map((item) => <option key={item}>{item}</option>)}</></select></label>
          <label className="block text-sm font-medium text-slate-700">Your immediate status<select value={driverStatus} onChange={(event) => setDriverStatus(event.target.value)} className="mt-1.5 w-full border border-slate-300 rounded-sm px-3 py-2 text-sm font-normal"><>{DRIVER_STATUSES.map((item) => <option key={item}>{item}</option>)}</></select></label>
          <label className="block text-sm font-medium text-slate-700">Brief details <span className="font-normal text-slate-400">(optional)</span><textarea value={details} onChange={(event) => setDetails(event.target.value)} rows="3" placeholder="Example: road blocked by debris near the bridge; no injuries." className="mt-1.5 w-full border border-slate-300 rounded-sm px-3 py-2 text-sm font-normal resize-none" /></label>
          <div className="text-xs text-slate-500 flex items-start gap-2"><MapPin size={14} className="shrink-0 mt-0.5" />Last known position: {vehicle?.currentLocation || "Current route position"}{route ? ` · ${route.roadName}` : ""}</div>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-3"><button type="button" onClick={onClose} className="text-sm font-medium text-slate-600 px-3 py-2">Cancel</button><button type="submit" className="bg-red-700 hover:bg-red-800 text-white text-sm font-semibold px-4 py-2 rounded-sm">Send emergency report</button></div>
      </form>
    </div>
  );
}

export default EmergencyReportModal;
