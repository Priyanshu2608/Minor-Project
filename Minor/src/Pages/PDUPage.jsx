import { useState, useEffect, useCallback } from "react";

function useLiveData(url, interval = 5000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url);
      const json = await res.json();
      setData(json.data || json);
    } catch {/* ignore */} finally { setLoading(false); }
  }, [url]);
  useEffect(() => { fetchData(); const id = setInterval(fetchData, interval); return () => clearInterval(id); }, [fetchData, interval]);
  return { data, loading };
}

function StatCard({ title, value }) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow">
      <p className="text-slate-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-cyan-400 mt-2">{value}</h2>
    </div>
  );
}

export default function PDUPage() {
  const { data: pduData, loading } = useLiveData("/api/pdu");
  const [filter, setFilter] = useState("all");

  const allSessions = pduData?.items?.flatMap((u) =>
    (u.pdu || []).map((s) => ({ ...s, supi: u.supi, ue_activity: u.ue_activity }))
  ) || [];

  const filtered = filter === "all" ? allSessions : allSessions.filter((s) => s.pdu_state === filter);
  const active = allSessions.filter((s) => s.pdu_state === "active").length;
  const inactive = allSessions.filter((s) => s.pdu_state !== "active").length;

  const stateBreakdown = [
    { name: "Active", value: active, color: "bg-green-400" },
    { name: "Inactive", value: inactive, color: "bg-yellow-400" },
  ];
  const maxStateValue = Math.max(...stateBreakdown.map((i) => i.value), 1);
  const uniqueSlices = new Set(allSessions.map((s) => `${s.snssai?.sst}-${s.snssai?.sd}`)).size;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400">PDU Session Monitor</h1>
        <select
          className="bg-slate-800 border border-slate-700 text-white px-3 py-1 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="bg-slate-900 p-5 rounded-xl border border-slate-800 animate-pulse h-20" />)}</div>
      ) : (
        <>
          <div className="grid md:grid-cols-4 gap-6">
            <StatCard title="Total Sessions" value={allSessions.length} />
            <StatCard title="Active" value={active} />
            <StatCard title="Inactive" value={inactive} />
            <StatCard title="Unique Slices" value={uniqueSlices || 1} />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-cyan-400 mb-5">Session State Distribution</h2>
            <div className="h-44 flex items-end gap-6">
              {stateBreakdown.map((item) => (
                <div key={item.name} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
                  <div className="w-full bg-slate-800 rounded-t-md h-full flex items-end">
                    <div className={`${item.color} w-full rounded-t-md transition-all duration-700`} style={{ height: `${(item.value / maxStateValue) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-300">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-4">SUPI</th>
                  <th className="p-4">PSI</th>
                  <th className="p-4">DNN</th>
                  <th className="p-4">IP</th>
                  <th className="p-4">Slice</th>
                  <th className="p-4">5QI</th>
                  <th className="p-4">State</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-4 text-slate-500 text-center">No sessions</td></tr>
                ) : filtered.map((s, i) => (
                  <tr key={i} className="border-t border-slate-800">
                    <td className="p-4 font-mono text-xs">{s.supi}</td>
                    <td className="p-4">{s.psi}</td>
                    <td className="p-4">{s.dnn}</td>
                    <td className="p-4 text-cyan-400">{s.ipv4 || "—"}</td>
                    <td className="p-4">SST {s.snssai?.sst} / {s.snssai?.sd}</td>
                    <td className="p-4">{s.qos_flows?.[0]?.["5qi"] ?? "—"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${s.pdu_state === "active" ? "bg-green-600 text-white" : "bg-yellow-600 text-white"}`}>
                        {s.pdu_state || s.ue_activity || "unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}