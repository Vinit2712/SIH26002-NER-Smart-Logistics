import StatusIndicator from "./StatusIndicator";

function VehicleTable({ vehicles }) {
  return (
    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-left">
            <th className="px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase">Vehicle ID</th>
            <th className="px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase">Origin</th>
            <th className="px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase">Destination</th>
            <th className="px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase">Current Location</th>
            <th className="px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase">Commodity</th>
            <th className="px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase">Status</th>
            <th className="px-4 py-2.5 font-semibold text-slate-500 text-xs uppercase">Delay</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-700">{v.id}</td>
              <td className="px-4 py-3 text-slate-600">{v.origin}</td>
              <td className="px-4 py-3 text-slate-600">{v.destination}</td>
              <td className="px-4 py-3 text-slate-600">{v.currentLocation}</td>
              <td className="px-4 py-3 text-slate-600">{v.commodity}</td>
              <td className="px-4 py-3"><StatusIndicator status={v.status} /></td>
              <td className="px-4 py-3 text-slate-600">
                {v.delayMinutes >= 999 ? "—" : v.delayMinutes === 0 ? "On time" : `${v.delayMinutes} min`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VehicleTable;