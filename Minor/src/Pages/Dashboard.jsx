import { useState, useEffect, useCallback } from "react";
import StatCard from "../components/StatCard";
import NetworkFunctionStatus from "../components/NetworkFunctionStatus";
import SlicePanel from "../components/SlicePanel";

function TrendChart({ data, dataKey, color, label }) {
  if (!data || data.length < 2) return <div className="h-24 bg-slate-800/20 rounded-xl animate-pulse" />;
  
  const min = Math.min(...data.map(d => parseFloat(d[dataKey])));
  const max = Math.max(...data.map(d => parseFloat(d[dataKey]))) || 1;
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((parseFloat(d[dataKey]) - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="relative h-24 w-full">
      <div className="absolute top-0 right-0 text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</div>
      <svg className="h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M 0,100 L ${points} L 100,100 Z`} fill={`url(#grad-${dataKey})`} />
        <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
      </svg>
    </div>
  );
}

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
  const { data: ueData, source: ueSource } = useLiveData("/api/ue");
  const { data: subData } = useLiveData("/api/subscribers");
  const { data: logData } = useLiveData("/api/logs", 3000);
  const { data: historyData } = useLiveData("/api/metrics/history", 2000);

  const ues = ueData?.items || [];
  const subs = subData || [];
  const logs = logData || [];
  const history = historyData || [];
  
  const connectedUEs = ues.filter(u => u.cm_state === "connected").length;
  const activeUE = ues.find(u => u.metrics) || ues[0];
  const metrics = activeUE?.metrics || { throughput_dl: "0.00", throughput_ul: "0.00", latency: "0.0", signal: -100 };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter">5G CORE <span className="text-cyan-400">PRO</span> MONITOR</h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-black uppercase">v2.7.0-STABLE</span>
             <p className="text-slate-500 text-xs font-semibold">Real-time Control Plane & Traffic Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
              <button className="px-3 py-1 text-[10px] font-bold text-white bg-slate-800 rounded-md shadow-sm">Real-time</button>
              <button className="px-3 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-300">Historical</button>
           </div>
           <div className="flex items-center gap-2 text-xs bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
              <span className="text-slate-300 font-bold uppercase tracking-tighter">System Online</span>
           </div>
        </div>
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Provisioned Subs" value={subs.length} />
        <StatCard title="Active Radio Links" value={connectedUEs} />
        <StatCard title="Total Traffic DL" value={`${(parseFloat(metrics.throughput_dl) * 1.5).toFixed(1)} GB`} />
        <StatCard title="NAS Success Rate" value="99.98%" />
      </div>

      {/* Professional Traffic Charts (Grafana-style) */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           {/* Primary Performance Matrix */}
           <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-10 w-64 h-64 bg-cyan-500/5 rounded-full -mt-32 -mr-32 blur-3xl" />
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-slate-300 text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                   <span className="w-1 h-3 bg-cyan-500 rounded-full" /> GTP-U Data Flow Analysis
                </h3>
                <div className="flex gap-4">
                   <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Downlink</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Uplink</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <TrendChart data={history} dataKey="dl" color="#22d3ee" label="Downlink (Mbps)" />
                    <div className="flex items-baseline justify-between mt-2">
                       <span className="text-4xl font-black text-white">{metrics.throughput_dl}</span>
                       <span className="text-cyan-400 font-bold text-sm tracking-tighter">LIVE DL</span>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <TrendChart data={history} dataKey="ul" color="#a855f7" label="Uplink (Mbps)" />
                    <div className="flex items-baseline justify-between mt-2">
                       <span className="text-4xl font-black text-white">{metrics.throughput_ul}</span>
                       <span className="text-purple-400 font-bold text-sm tracking-tighter">LIVE UL</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Core Event Monitor (Terminal) */}
           <div className="bg-black/60 border border-slate-800 rounded-2xl p-6 font-mono text-[11px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-4 right-4 text-[9px] font-bold text-slate-600 group-hover:text-cyan-500/50 transition-colors uppercase">Real-time Stream</div>
              <div className="h-40 overflow-y-auto space-y-1 custom-scrollbar scroll-smooth">
                {logs.length === 0 ? (
                  <p className="text-slate-700 italic">Initialize Core Socket...</p>
                ) : logs.map((log, i) => (
                  <div key={i} className="flex gap-3 items-start animate-in slide-in-from-left duration-300">
                    <span className="text-slate-600 shrink-0">[{log.time}]</span>
                    <span className={`font-bold w-12 shrink-0 ${log.comp === 'AMF' ? 'text-cyan-400' : log.comp === 'UDM' ? 'text-purple-400' : 'text-slate-400'}`}>{log.comp}</span>
                    <span className="text-slate-300">| {log.msg}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Status Panels */}
        <div className="space-y-6">
           {/* Latency Matrix */}
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Procedural Latency (RTT)</h3>
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <span className="text-4xl font-black text-white">{metrics.latency}</span>
                    <span className="text-xs font-bold text-slate-500 ml-1">ms</span>
                 </div>
                 <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${metrics.latency < 8 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                   {metrics.latency < 8 ? 'Ultra-Reliable' : 'Stable'}
                 </div>
              </div>
              <TrendChart data={history} dataKey="latency" color="#f59e0b" label="RTT Jitter" />
           </div>

           {/* Radio Quality */}
           <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Signal Integrity (RSRP)</h3>
              <div className="flex items-center justify-between">
                 <div className="text-2xl font-black text-white">{metrics.signal} <span className="text-[10px] font-bold text-slate-600 uppercase">dBm</span></div>
                 <div className="flex gap-1 items-end h-6">
                    {[1,2,3,4,5].map(i => (
                       <div key={i} className={`w-1 rounded-sm ${i <= (Math.abs(metrics.signal) < 85 ? 5 : 3) ? (metrics.signal > -80 ? 'bg-cyan-400' : 'bg-yellow-400') : 'bg-slate-800'}`} style={{ height: `${i*100/5}%` }} />
                    ))}
                 </div>
              </div>
              <div className="mt-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                 <div className={`h-full transition-all duration-1000 ${metrics.signal > -85 ? 'bg-cyan-400' : 'bg-yellow-500'}`} style={{ width: `${Math.max(0, 100 + parseInt(metrics.signal))}%` }} />
              </div>
           </div>

           <SlicePanel />
        </div>
      </div>

      {/* Network Health Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-slate-900/40 p-1 rounded-2xl border border-slate-800">
            <NetworkFunctionStatus />
         </div>
         <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 relative z-0">
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Subscriber Distribution Matrix</h3>
            <div className="flex items-center gap-12 h-32">
               <div className="relative w-32 h-32 scale-110">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                     <circle cx="64" cy="64" r="50" fill="transparent" stroke="#1e293b" strokeWidth="12" />
                     <circle cx="64" cy="64" r="50" fill="transparent" stroke="#22d3ee" strokeWidth="12" 
                       strokeDasharray={`${(connectedUEs/Math.max(subs.length,1))*314} 314`} 
                       className="transition-all duration-1000 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <p className="text-2xl font-black text-white">{Math.round((connectedUEs/Math.max(subs.length,1))*100)}%</p>
                  </div>
               </div>
               <div className="flex-1 space-y-4 font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                     <span className="text-slate-500 uppercase font-black">Total Databases</span>
                     <span className="text-white font-black">{subs.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                     <span className="text-cyan-500 uppercase font-black">Active Contexts</span>
                     <span className="text-cyan-400 font-black">{connectedUEs}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                     <span className="text-slate-600 uppercase font-black">Idle Pool</span>
                     <span className="text-slate-400 font-black">{subs.length - connectedUEs}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}