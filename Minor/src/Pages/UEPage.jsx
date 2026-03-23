import { useState, useEffect, useCallback } from "react";

function useLiveData(url, interval = 5000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url);
      const json = await res.json();
      setData(json.data || json);
    } catch {/* ignore */} finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, interval);
    return () => clearInterval(id);
  }, [fetchData, interval]);

  return { data, loading };
}

export default function UEPage() {
  const { data: ueData, loading } = useLiveData("/api/ue");
  const ues = ueData?.items || [];
  const connected = ues.filter((u) => u.cm_state === "connected").length;
  const idle = ues.filter((u) => u.cm_state === "idle").length;
  const totalUes = ues.length || 1;

  const ueStateBreakdown = [
    { name: "Connected", count: connected, color: "bg-green-400" },
    { name: "Idle", count: idle, color: "bg-yellow-400" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">UE Management</h1>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-pulse h-32" />
      ) : (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-cyan-400 mb-5">UE State Distribution</h2>
            <div className="space-y-4">
              {ueStateBreakdown.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm text-slate-300 mb-1">
                    <span>{item.name}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full">
                    <div className={`${item.color} h-3 rounded-full transition-all duration-700`} style={{ width: `${(item.count / totalUes) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-4">SUPI</th>
                  <th className="p-4">CM State</th>
                  <th className="p-4">gNB ID</th>
                  <th className="p-4">TAC</th>
                  <th className="p-4">PDU Sessions</th>
                </tr>
              </thead>
              <tbody>
                {ues.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-slate-500 text-center">No UEs connected</td></tr>
                ) : ues.map((ue, i) => (
                  <tr key={i} className="border-t border-slate-800">
                    <td className="p-4 font-mono text-xs">{ue.supi}</td>
                    <td className="p-4">
                      <span className={ue.cm_state === "connected" ? "text-green-400" : "text-yellow-400"}>
                        {ue.cm_state}
                      </span>
                    </td>
                    <td className="p-4">{ue.gnb?.gnb_id ?? "—"}</td>
                    <td className="p-4">{ue.location?.nr_tai?.tac ?? "—"}</td>
                    <td className="p-4 text-cyan-400">{ue.pdu_sessions_count ?? 0}</td>
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