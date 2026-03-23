export default function SlicePanel({ pduSessions = [] }) {
  // Derive slice info from live PDU session data
  const sliceMap = {};
  pduSessions.forEach((s) => {
    const key = `${s.snssai?.sst}-${s.snssai?.sd}`;
    if (!sliceMap[key]) {
      sliceMap[key] = {
        sst: s.snssai?.sst,
        sd: s.snssai?.sd,
        name: s.snssai?.sst === 1 ? "eMBB" : s.snssai?.sst === 2 ? "URLLC" : "mMTC",
        count: 0,
        color: s.snssai?.sst === 1 ? "bg-cyan-400" : s.snssai?.sst === 2 ? "bg-green-400" : "bg-purple-400",
      };
    }
    sliceMap[key].count++;
  });

  const slices = Object.values(sliceMap);
  const maxCount = Math.max(...slices.map((s) => s.count), 1);

  // Fallback if no live sessions yet
  const displaySlices = slices.length > 0 ? slices : [
    { sst: 1, sd: "ffffff", name: "eMBB", count: 0, color: "bg-cyan-400" },
  ];

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-cyan-400">Network Slice Analytics</h2>
        <span className="text-sm text-slate-400">Total Slices: {displaySlices.length}</span>
      </div>
      <div className="space-y-6">
        {displaySlices.map((slice, i) => (
          <div key={i} className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-white font-semibold">SST {slice.sst} — {slice.name}</p>
                <p className="text-xs text-slate-400">SD: {slice.sd}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-300 text-sm">Active Sessions</p>
                <p className="text-lg font-bold text-cyan-400">{slice.count}</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Usage</span>
                <span>{Math.round((slice.count / maxCount) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full">
                <div
                  className={`${slice.color} h-2 rounded-full transition-all duration-700`}
                  style={{ width: `${(slice.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}