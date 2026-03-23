import { useState, useEffect } from "react";

export default function ActivityTimeline() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/logs");
        const json = await res.json();
        setLogs(json.data || []);
      } catch (err) {
        console.error("Log fetch error:", err);
      }
    };

    fetchLogs();
    const id = setInterval(fetchLogs, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
       <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Historical Activity Trace</h3>
       
       <div className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-slate-600 italic text-xs">Waiting for events...</p>
          ) : logs.map((log, i) => (
            <div key={i} className="flex gap-4 group">
               <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${log.comp === 'AMF' ? 'bg-cyan-500' : 'bg-purple-500'} shadow-[0_0_8px_rgba(34,211,238,0.2)]`} />
                  <div className="w-px flex-1 bg-slate-800 group-last:hidden mt-1" />
               </div>
               <div className="pb-4">
                  <p className="text-[10px] text-slate-500 font-bold tracking-tighter mb-1 uppercase">
                    {log.time} — <span className="text-slate-400">{log.comp}</span>
                  </p>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">{log.msg}</p>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}