export default function SlicePanel() {
  const mockSlices = [
    {
      sst: 1,
      sd: "ffffff",
      name: "eMBB",
      usage: 65,
      ueCount: 7,
      color: "bg-cyan-400",
    },
    {
      sst: 2,
      sd: "aaaaaa",
      name: "URLLC",
      usage: 25,
      ueCount: 3,
      color: "bg-green-400",
    },
    {
      sst: 3,
      sd: "bbbbbb",
      name: "mMTC",
      usage: 10,
      ueCount: 2,
      color: "bg-purple-400",
    },
  ];

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
      {/* Title */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-cyan-400">
          Network Slice Analytics
        </h2>
        <span className="text-sm text-slate-400">
          Total Slices: {mockSlices.length}
        </span>
      </div>

      {/* Slice List */}
      <div className="space-y-6">
        {mockSlices.map((slice, index) => (
          <div key={index} className="bg-slate-800 p-4 rounded-lg">
            
            {/* Slice Header */}
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-white font-semibold">
                  SST {slice.sst} - {slice.name}
                </p>
                <p className="text-xs text-slate-400">
                  SD: {slice.sd}
                </p>
              </div>

              <div className="text-right">
                <p className="text-slate-300 text-sm">
                  UE Count
                </p>
                <p className="text-lg font-bold text-cyan-400">
                  {slice.ueCount}
                </p>
              </div>
            </div>

            {/* Usage Bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Usage</span>
                <span>{slice.usage}%</span>
              </div>

              <div className="w-full bg-slate-700 h-2 rounded-full">
                <div
                  className={`${slice.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${slice.usage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}