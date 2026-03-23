import { useState, useEffect, useCallback } from "react";
import StatCard from "../components/StatCard";
import NetworkFunctionStatus from "../components/NetworkFunctionStatus";
import ActivityTimeline from "../components/ActivityTimeline";
import SlicePanel from "../components/SlicePanel";

function useLiveData(url, interval = 5000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("loading");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url);
      const json = await res.json();
      setData(json.data || json);
      setSource(json.source || "live");
    } catch {
      setSource("error");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, interval);
    return () => clearInterval(id);
  }, [fetchData, interval]);

  return { data, loading, source };
}

export default function Dashboard() {
  const { data: ueData, loading: ueLoading, source: ueSource } = useLiveData("/api/ue");
  const { data: gnbData } = useLiveData("/api/gnb");
  const { data: pduData } = useLiveData("/api/pdu");

  const ues = ueData?.items || [];
  const gnbs = gnbData?.items || [];
  const pdus = pduData?.items?.flatMap((u) => u.pdu || []) || [];
  const connectedUEs = ues.filter((u) => u.cm_state === "connected").length;

  // Build slice distribution from UE data
  const sliceCounts = {};
  ues.forEach((ue) => {
    (ue.pdu_sessions || []).forEach((s) => {
      const key = `SST ${s.snssai?.sst}`;
      sliceCounts[key] = (sliceCounts[key] || 0) + 1;
    });
  });
  const sliceColors = ["bg-cyan-400", "bg-green-400", "bg-purple-400"];
  const ueDistribution = Object.entries(sliceCounts).map(([name, count], i) => ({
    name, count, color: sliceColors[i % sliceColors.length],
  }));

  // gNB load from gnb data
  const gnbLoad = gnbs.map((g) => ({ name: `gNB-${g.gnb_id}`, load: Math.min(100, g.num_connected_ues * 20) }));

  // Session trend — static visual (no time-series from API)
  const sessionTrend = [4, 6, 5, pdus.length + 3, pdus.length + 2, pdus.length + 5];
  const maxSessions = Math.max(...sessionTrend, 1);

  // Uplink traffic — dummy visual
  const trafficTrend = [32, 40, 35, 52, 47, 61, pdus.length * 10 + 45];
  const maxTraffic = Math.max(...trafficTrend, 1);

  const sourceBadge = {
    live: "bg-green-500/20 text-green-400 border border-green-500/30",
    "demo-fallback": "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    demo: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    loading: "bg-slate-700 text-slate-400",
    error: "bg-red-500/20 text-red-400 border border-red-500/30",
  };

  return (
    <div className="space-y-10">
      {/* Source Badge */}
      <div className="flex items-center gap-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${sourceBadge[ueSource] || sourceBadge.loading}`}>
          {ueSource === "live" ? "● Live — Open5GS Core" :
           ueSource === "demo-fallback" ? "⚠ Demo Fallback (Core Unreachable)" :
           ueSource === "demo" ? "◉ Demo Mode" : "○ Loading..."}
        </span>
        <span className="text-xs text-slate-500">Auto-refresh: 5s</span>
      </div>

      {/* Stats */}
      {ueLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-900 p-5 rounded-xl border border-slate-800 animate-pulse h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <StatCard title="Total UEs" value={ues.length} />
          <StatCard title="Connected UEs" value={connectedUEs} />
          <StatCard title="gNBs" value={gnbs.length} />
          <StatCard title="Active Sessions" value={pdus.length} />
          <StatCard title="Slices" value={Object.keys(sliceCounts).length || 1} />
        </div>
      )}

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* UE Distribution */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold text-cyan-400 mb-5">UE Distribution by Slice</h2>
          {ueDistribution.length === 0 ? (
            <p className="text-slate-500 text-sm">No UEs connected</p>
          ) : (
            <div className="space-y-4">
              {ueDistribution.map((slice) => (
                <div key={slice.name}>
                  <div className="flex justify-between text-sm text-slate-300 mb-1">
                    <span>{slice.name}</span>
                    <span>{slice.count} UEs</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full">
                    <div className={`${slice.color} h-3 rounded-full transition-all duration-700`} style={{ width: `${(slice.count / Math.max(ues.length, 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Session Trend */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold text-cyan-400 mb-5">Session Trend</h2>
          <div className="h-44 flex items-end gap-3">
            {sessionTrend.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-800 rounded-t-md h-full flex items-end">
                  <div className="w-full bg-cyan-400 rounded-t-md transition-all duration-700" style={{ height: `${(s / maxSessions) * 100}%` }} />
                </div>
                <span className="text-[11px] text-slate-400">T-{(sessionTrend.length - 1 - i) * 5}m</span>
              </div>
            ))}
          </div>
        </div>

        {/* gNB Load */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold text-cyan-400 mb-5">gNB Load</h2>
          {gnbLoad.length === 0 ? (
            <p className="text-slate-500 text-sm">No gNBs online</p>
          ) : (
            <div className="space-y-4">
              {gnbLoad.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm text-slate-300 mb-1">
                    <span>{item.name}</span>
                    <span>{item.load}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full">
                    <div className="bg-green-400 h-3 rounded-full transition-all duration-700" style={{ width: `${item.load}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Uplink Traffic */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold text-cyan-400 mb-5">Uplink Traffic Trend</h2>
          <div className="h-44 flex items-end gap-2">
            {trafficTrend.map((value, index) => (
              <div key={index} className="flex-1 h-full flex flex-col justify-end">
                <div className="w-full bg-purple-400 rounded-t-md transition-all duration-700" style={{ height: `${(value / maxTraffic) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[11px] text-slate-400">
            <span>T-30m</span><span>Now</span>
          </div>
        </div>
      </div>

      {/* NF + Slice */}
      <div className="grid md:grid-cols-2 gap-6">
        <NetworkFunctionStatus />
        <SlicePanel pduSessions={pdus} />
      </div>

      <ActivityTimeline ues={ues} pdus={pdus} />
    </div>
  );
}