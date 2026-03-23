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

export default function GNBPage() {
  const { data: gnbData, loading } = useLiveData("/api/gnb");
  const { data: ueData } = useLiveData("/api/ue");

  const gnbs = gnbData?.items || [];
  const ues = ueData?.items || [];
  const online = gnbs.filter((g) => g.ng?.setup_success).length;
  const totalConnectedUEs = gnbs.reduce((sum, g) => sum + (g.num_connected_ues || 0), 0);
  const maxUEs = Math.max(...gnbs.map((g) => g.num_connected_ues || 0), 1);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-cyan-400">gNB Monitoring</h1>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <div key={i} className="bg-slate-900 p-5 rounded-xl border border-slate-800 animate-pulse h-20" />)}</div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard title="Total gNBs" value={gnbs.length} />
            <StatCard title="Online" value={online} />
            <StatCard title="Total Connected UEs" value={totalConnectedUEs} />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-cyan-400 mb-5">Connected UEs per gNB</h2>
            {gnbs.length === 0 ? (
              <p className="text-slate-500 text-sm">No gNBs connected</p>
            ) : (
              <div className="h-44 flex items-end gap-4">
                {gnbs.map((gnb) => (
                  <div key={gnb.gnb_id} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
                    <div className="w-full bg-slate-800 rounded-t-md h-full flex items-end">
                      <div
                        className="w-full bg-cyan-400 rounded-t-md transition-all duration-700"
                        style={{ height: `${((gnb.num_connected_ues || 0) / maxUEs) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">{gnb.gnb_id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-4">gNB ID</th>
                  <th className="p-4">PLMN</th>
                  <th className="p-4">TAC</th>
                  <th className="p-4">Slices</th>
                  <th className="p-4">Connected UEs</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {gnbs.length === 0 ? (
                  <tr><td colSpan={6} className="p-4 text-slate-500 text-center">No gNBs online</td></tr>
                ) : gnbs.map((gnb, i) => {
                  const slices = gnb.supported_ta_list?.[0]?.bplmns?.[0]?.snssai || [];
                  return (
                    <tr key={i} className="border-t border-slate-800">
                      <td className="p-4">{gnb.gnb_id}</td>
                      <td className="p-4">{gnb.plmn}</td>
                      <td className="p-4">{gnb.supported_ta_list?.[0]?.tac || "—"}</td>
                      <td className="p-4 text-xs">
                        {slices.map((s, j) => (
                          <span key={j} className="mr-1 px-1 py-0.5 bg-slate-700 rounded">SST {s.sst}</span>
                        ))}
                      </td>
                      <td className="p-4 text-cyan-400">{gnb.num_connected_ues || 0}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${gnb.ng?.setup_success ? "bg-green-600" : "bg-red-600"}`}>
                          {gnb.ng?.setup_success ? "online" : "offline"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}