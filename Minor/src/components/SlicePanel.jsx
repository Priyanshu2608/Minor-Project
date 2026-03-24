import { useState, useEffect } from "react";

export default function SlicePanel() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/ue");
        const json = await res.json();
        const ues = json.data?.items || [];
        
        // Group by Slice
        const slicesMap = {
          "1-ffffff": { sst: 1, sd: "ffffff", name: "eMBB (Default)", ues: 0, color: "bg-cyan-500", traffic: 0 },
          "2-000001": { sst: 2, sd: "000001", name: "URLLC (Gaming/AR)", ues: 0, color: "bg-purple-500", traffic: 0 },
          "3-111111": { sst: 3, sd: "111111", name: "mMTC (IoT)", ues: 0, color: "bg-green-500", traffic: 0 },
        };

        ues.forEach(ue => {
          // Try to get slice from UE location or PDU sessions if available
          const sst = ue.slice?.[0]?.sst || (ue.pdu?.[0]?.snssai?.sst) || 1;
          const sd = ue.slice?.[0]?.sd || (ue.pdu?.[0]?.snssai?.sd) || "ffffff";
          const sliceKey = `${sst}-${sd}`;

          if (slicesMap[sliceKey]) {
            slicesMap[sliceKey].ues++;
            if (ue.metrics) slicesMap[sliceKey].traffic += parseFloat(ue.metrics.throughput_dl);
          } else {
            // Add dynamic slice if not predefined
            const sstMap = { 1: "eMBB", 2: "URLLC", 3: "MIoT" };
            slicesMap[sliceKey] = { 
              sst, 
              sd, 
              name: sstMap[sst] ? `${sstMap[sst]} (Dynamic)` : `Slice ${sst}/${sd}`, 
              ues: 1, 
              color: "bg-slate-500", 
              traffic: ue.metrics ? parseFloat(ue.metrics.throughput_dl) : 0 
            };
          }
        });

        setData(Object.values(slicesMap));
      } catch (err) {
        console.error("Slice fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
       <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Network Slice Analytics</h3>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">3 Configured</span>
       </div>

       <div className="space-y-6">
          {data.map((slice, i) => (
            <div key={i} className="group cursor-help">
               <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{slice.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">SST: {slice.sst} | SD: {slice.sd}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white tracking-widest">{slice.ues} <span className="text-[9px] text-slate-500">UEs</span></p>
                    <p className="text-[10px] font-black text-cyan-500/80">{slice.traffic.toFixed(1)} Mbps</p>
                  </div>
               </div>
               <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${slice.color} transition-all duration-1000 shadow-[0_0_8px_rgba(34,211,238,0.2)]`} style={{ width: `${Math.min(100, (slice.ues/10)*100)}%` }} />
               </div>
            </div>
          ))}
       </div>

       <div className="mt-8 pt-6 border-t border-slate-800/50">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-600">
             <span>NSSAI Status</span>
             <span className="text-green-500">● Operational</span>
          </div>
       </div>
    </div>
  );
}