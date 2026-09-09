import { AlertTriangle, MapPin, Mountain, CalendarDays } from "lucide-react";
import { getHistoricalExposureScore } from "../mockData/landslides";

function LandslideHistory({ events = [], routeName, currentRiskScore }) {
  const historicalExposureScore = getHistoricalExposureScore(events);
  return (
    <section className="bg-white border border-slate-200 rounded-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-start gap-3">
        <div className="p-2 rounded-sm bg-amber-50 text-amber-700"><Mountain size={18} /></div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Historical landslides on this route</h2>
          <p className="text-xs text-slate-500 mt-0.5">Past incidents within 28 km of {routeName || "the selected route"}</p>
          <p className="text-xs text-slate-500 mt-1">Historical exposure: <strong className="text-slate-700">{historicalExposureScore}/20</strong> · weighted down as reports get older</p>
        </div>
      </div>

      {events.length ? (
        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {events.map((event) => (
            <div key={event.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">{event.location}</p>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-1 rounded-sm">{event.susceptibility}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1"><CalendarDays size={13} />{new Date(`${event.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="flex items-center gap-1"><MapPin size={13} />{event.distanceFromRouteKm.toFixed(1)} km from route</span>
                <span>{event.category} · {event.trigger}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-5 flex items-start gap-3 text-sm text-slate-500">
          <AlertTriangle size={18} className="text-slate-400 shrink-0 mt-0.5" />
          <p>No historical incidents were found within the selected route corridor in the loaded inventory.</p>
        </div>
      )}

      <p className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
        Source: NASA Global Landslide Catalog inventory. Historical records are capped at 20 points and decay by half every five years; {typeof currentRiskScore === "number" ? `the current route score is ${currentRiskScore}/100 and should be driven by live conditions.` : "they do not indicate a current road closure."}
      </p>
    </section>
  );
}

export default LandslideHistory;
