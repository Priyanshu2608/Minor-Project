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
    if (!confirm(`Delete subscriber ${imsi}?`)) return;
    try {
      const res = await fetch(`/api/subscribers/${imsi}`, { method: "DELETE" });
      if (res.ok) refresh();
    } catch (err) {
      alert("Failed to delete subscriber");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-cyan-400">Subscriber Management</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Add Form */}
        <div className="lg:col-span-1 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="text-cyan-400">⊕</span> Add New Subscriber
          </h2>
          <form className="space-y-4" onSubmit={handleAdd}>
            <div>
              <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">IMSI</label>
              <input 
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                value={form.imsi} onChange={e => setForm({...form, imsi: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Security Key (K)</label>
              <input 
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                value={form.k} onChange={e => setForm({...form, k: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">OPC</label>
              <input 
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                value={form.opc} onChange={e => setForm({...form, opc: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">SST</label>
                <input 
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  value={form.sst} onChange={e => setForm({...form, sst: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">SD</label>
                <input 
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  value={form.sd} onChange={e => setForm({...form, sd: e.target.value})}
                />
              </div>
            </div>
            <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded transition-colors mt-2 shadow-lg shadow-cyan-900/20">
              Provision Subscriber
            </button>
          </form>
        </div>

        {/* List Table */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-semibold text-white tracking-wide">Provisioned Subscribers</h2>
            <span className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded">Total: {subscribers.length}</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/30 text-slate-400">
              <tr>
                <th className="p-4">IMSI</th>
                <th className="p-4">SST/SD</th>
                <th className="p-4">Provisioned At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center animate-pulse text-slate-500">Loading subscriber database...</td></tr>
              ) : subscribers.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500 italic">No subscribers found in database</td></tr>
              ) : subscribers.map((sub, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4 font-mono text-cyan-400">{sub.imsi}</td>
                  <td className="p-4 font-mono">
                    <span className="text-slate-300">{sub.sst}</span>
                    <span className="text-slate-500"> / </span>
                    <span className="text-slate-400">{sub.sd}</span>
                  </td>
                  <td className="p-4 text-slate-500">{sub.createdAt ? new Date(sub.createdAt).toLocaleString() : "—"}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(sub.imsi)}
                      className="text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
