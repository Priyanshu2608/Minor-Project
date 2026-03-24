import { useState, useEffect, useCallback } from "react";

function useSubscribers(interval = 5000) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = useCallback(async () => {
    try {
      const res = await fetch("/api/subscribers");
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubs();
    const id = setInterval(fetchSubs, interval);
    return () => clearInterval(id);
  }, [fetchSubs, interval]);

  return { data, loading, refresh: fetchSubs };
}

export default function SubscribersPage() {
  const { data: subscribers, loading, refresh } = useSubscribers();
  const [form, setForm] = useState({
    imsi: "001011234567898",
    k: "465B5CE8B199B49FAA5F0A2EE238A6BC",
    opc: "E8ED289DEBA952E4283B54E88E6183CA",
    sst: "1",
    sd: "ffffff"
  });
  const [selectedSub, setSelectedSub] = useState(null);
  const [editSub, setEditSub] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        alert("Subscriber added successfully!");
        refresh();
      }
    } catch (err) {
      alert("Failed to add subscriber");
    }
  };

  const handleDelete = async (imsi) => {
    console.log(`[FRONTEND] Triggering delete for IMSI: ${imsi}`);
    try {
      const res = await fetch(`/api/subscribers/${imsi}`, { method: "DELETE" });
      if (res.ok) {
        console.log(`[FRONTEND] Delete success for IMSI: ${imsi}`);
        await refresh();
        setDeleteId(null);
      } else {
        console.error(`[FRONTEND] Delete failed with status: ${res.status}`);
      }
    } catch (err) {
      console.error("[FRONTEND] Network error during delete:", err);
      alert("Failed to delete subscriber");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/subscribers/${editSub.imsi}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editSub.formData)
      });
      if (res.ok) {
        alert("Subscriber updated successfully!");
        setEditSub(null);
        refresh();
      }
    } catch (err) {
      alert("Failed to update subscriber");
    }
  };

  const SubscriberModal = ({ sub, onClose }) => {
    if (!sub) return null;
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full" />
          
          <div className="p-6 border-b border-slate-800 flex justify-between items-center relative gap-4">
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Subscriber Profile</h3>
              <p className="text-[10px] font-mono text-cyan-400 mt-1 uppercase tracking-widest">{sub.imsi}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">&times;</button>
          </div>

          <div className="p-8 grid md:grid-cols-2 gap-8 relative">
            <div className="space-y-6">
              <section>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Security Vector</h4>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-600 block mb-1 uppercase tracking-widest">Master Key (K)</span>
                    <span className="text-white break-all">{sub.security?.k || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block mb-1 uppercase tracking-widest">OPC Vector</span>
                    <span className="text-white break-all">{sub.security?.opc || "—"}</span>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Provisioning Data</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-600 block text-[9px] uppercase tracking-widest mb-1">Created At</span>
                    <span className="text-white text-xs font-bold">{sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "System"}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-600 block text-[9px] uppercase tracking-widest mb-1">Status</span>
                    <span className="text-green-500 text-xs font-bold">PROVISIONED</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Active Slices</h4>
                {(sub.slice || []).length === 0 ? (
                  <p className="text-slate-600 text-[11px] italic">No active slices configured</p>
                ) : sub.slice.map((sl, index) => (
                  <div key={index} className="bg-slate-950 p-4 rounded-xl border border-slate-800 border-l-4 border-l-cyan-500 mb-3">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[11px] font-black text-white uppercase italic">Slice {index + 1}</span>
                       <span className="bg-cyan-500/10 text-cyan-400 text-[9px] px-2 py-0.5 rounded-full font-bold">PRIMARY</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400">SST: {sl.sst} | SD: {sl.sd}</p>
                  </div>
                ))}
              </section>

              <section>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Aggregated AMBR</h4>
                <div className="bg-slate-800/30 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Downlink</span>
                    <span className="text-white font-bold">{sub.ambr?.downlink?.value} {sub.ambr?.downlink?.unit === 3 ? "Gbps" : "Mbps"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Uplink</span>
                    <span className="text-white font-bold">{sub.ambr?.uplink?.value} {sub.ambr?.uplink?.unit === 3 ? "Gbps" : "Mbps"}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
          <div className="bg-slate-800/50 p-4 flex justify-end">
            <button onClick={onClose} className="bg-slate-950 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded-lg text-xs transition-colors border border-slate-700 uppercase tracking-widest">Close Record</button>
          </div>
        </div>
      </div>
    );
  };

  const EditModal = ({ sub, onClose }) => {
    if (!sub) return null;
    return (
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-black text-white uppercase tracking-widest">Modify Subscription</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
          </div>
          <form className="p-8 space-y-5" onSubmit={handleUpdate}>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">SST</label>
                  <input 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-cyan-500 font-mono"
                    value={sub.formData.sst} onChange={e => setEditSub({...sub, formData: {...sub.formData, sst: e.target.value}})}
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">SD</label>
                  <input 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-cyan-500 font-mono"
                    value={sub.formData.sd} onChange={e => setEditSub({...sub, formData: {...sub.formData, sd: e.target.value}})}
                  />
               </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Security Key (K)</label>
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-white focus:border-cyan-500 font-mono"
                value={sub.formData.k} onChange={e => setEditSub({...sub, formData: {...sub.formData, k: e.target.value}})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">OPC Vector</label>
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-white focus:border-cyan-500 font-mono"
                value={sub.formData.opc} onChange={e => setEditSub({...sub, formData: {...sub.formData, opc: e.target.value}})}
              />
            </div>
            <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-cyan-900/20 uppercase text-xs tracking-widest">
              Save Changes to UDM
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Subscriber <span className="text-cyan-400">Database</span></h1>

      {selectedSub && <SubscriberModal sub={selectedSub} onClose={() => setSelectedSub(null)} />}
      {editSub && <EditModal sub={editSub} onClose={() => setEditSub(null)} />}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Add Form */}
        <div className="lg:col-span-1 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl opacity-50" />
          <h2 className="text-sm font-black text-slate-400 mb-8 flex items-center gap-3 uppercase tracking-widest">
            <span className="w-1.5 h-4 bg-cyan-500 rounded-full" /> Provision New SIM
          </h2>
          <form className="space-y-5" onSubmit={handleAdd}>
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Subscriber IMSI</label>
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-mono"
                placeholder="00101123456789x"
                value={form.imsi} onChange={e => setForm({...form, imsi: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">SST</label>
                  <input 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    value={form.sst} onChange={e => setForm({...form, sst: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">SD</label>
                  <input 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    value={form.sd} onChange={e => setForm({...form, sd: e.target.value})}
                  />
               </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Security Key (K)</label>
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-white focus:outline-none focus:border-cyan-500 font-mono"
                value={form.k} onChange={e => setForm({...form, k: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">OPC</label>
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-white focus:outline-none focus:border-cyan-500 font-mono"
                value={form.opc} onChange={e => setForm({...form, opc: e.target.value})}
              />
            </div>
            <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl transition-all mt-4 shadow-xl shadow-cyan-900/20 uppercase text-xs tracking-widest">
              Push to Core UDM
            </button>
          </form>
        </div>

        {/* List Table */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl relative">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Registered UEs</h2>
            <div className="flex gap-2">
               <span className="text-[10px] bg-slate-800 text-slate-500 px-3 py-1 rounded-full font-bold">STABLE</span>
               <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full font-bold">TOTAL: {subscribers.length}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/50 text-slate-500">
                <tr>
                  <th className="p-5 font-black uppercase tracking-widest">Subscriber IMSI</th>
                  <th className="p-5 font-black uppercase tracking-widest">Slice (SST/SD)</th>
                  <th className="p-5 font-black uppercase tracking-widest">Provisioned</th>
                  <th className="p-5 text-right font-black uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr><td colSpan={4} className="p-20 text-center animate-pulse text-slate-600 font-bold uppercase tracking-tighter text-lg">Linking to core...</td></tr>
                ) : subscribers.length === 0 ? (
                  <tr><td colSpan={4} className="p-20 text-center text-slate-600 italic font-medium">UDR Database is empty</td></tr>
                ) : subscribers.map((sub, i) => (
                  <tr key={i} className="hover:bg-slate-800/20 transition-all group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
                        <span className="font-mono font-black text-white text-sm">{sub.imsi}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-bold">{sub.slice?.[0]?.sst || sub.sst || "1"}</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-400 font-mono underline decoration-slate-700">{sub.slice?.[0]?.sd || sub.sd || "ffffff"}</span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-500 font-medium">{sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "DEFAULT"}</td>
                    <td className="p-5 text-right flex items-center justify-end gap-2">
                       <button onClick={() => setSelectedSub(sub)} className="text-[10px] font-black uppercase text-cyan-400 hover:text-white hover:bg-cyan-500/10 px-3 py-1.5 rounded-lg transition-all">View</button>
                       <button 
                         onClick={() => setEditSub({ 
                           imsi: sub.imsi, 
                           formData: { 
                             sst: sub.slice?.[0]?.sst || sub.sst || "1", 
                             sd: sub.slice?.[0]?.sd || sub.sd || "ffffff",
                             k: sub.security?.k || "",
                             opc: sub.security?.opc || ""
                           } 
                         })} 
                         className="text-[10px] font-black uppercase text-slate-400 hover:text-white hover:bg-slate-500/10 px-3 py-1.5 rounded-lg transition-all"
                       >
                         Edit
                       </button>
                       {deleteId === sub.imsi ? (
                         <div className="flex items-center justify-end gap-2 animate-in slide-in-from-right duration-200">
                            <button onClick={() => setDeleteId(null)} className="text-[9px] font-black uppercase text-slate-500 hover:text-white px-2 py-1">Cancel</button>
                            <button onClick={() => handleDelete(sub.imsi)} className="text-[9px] font-black uppercase bg-red-600 text-white px-3 py-1 rounded shadow-lg shadow-red-900/20">Confirm</button>
                         </div>
                       ) : (
                        <button 
                          onClick={() => setDeleteId(sub.imsi)}
                          className="text-[10px] font-black uppercase text-red-500/50 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all"
                        >
                          Purge
                        </button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
