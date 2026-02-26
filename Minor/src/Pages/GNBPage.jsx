export default function GNBPage() {

  const mockGNBs = [
    {
      gnbId: 100,
      plmn: "99970",
      tac: 1,
      connectedUEs: 5,
      status: "online",
    },
    {
      gnbId: 101,
      plmn: "99970",
      tac: 2,
      connectedUEs: 3,
      status: "online",
    },
    {
      gnbId: 102,
      plmn: "99970",
      tac: 3,
      connectedUEs: 0,
      status: "offline",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <h1 className="text-2xl font-bold text-cyan-400">
        gNB Monitoring
      </h1>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard title="Total gNBs" value={mockGNBs.length} />
        <StatCard
          title="Online"
          value={mockGNBs.filter(g => g.status === "online").length}
        />
        <StatCard
          title="Total Connected UEs"
          value={mockGNBs.reduce((sum, g) => sum + g.connectedUEs, 0)}
        />
      </div>

      {/* Connected UEs Graph */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-cyan-400 mb-5">
          Connected UEs per gNB
        </h2>

        <div className="h-44 flex items-end gap-4">
          {mockGNBs.map((gnb) => {
            const maxUes = Math.max(...mockGNBs.map((item) => item.connectedUEs), 1);
            const height = (gnb.connectedUEs / maxUes) * 100;

            return (
              <div key={gnb.gnbId} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
                <div className="w-full bg-slate-800 rounded-t-md h-full flex items-end">
                  <div
                    className="w-full bg-cyan-400 rounded-t-md"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400">{gnb.gnbId}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* gNB Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="p-4">gNB ID</th>
              <th className="p-4">PLMN</th>
              <th className="p-4">TAC</th>
              <th className="p-4">Connected UEs</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockGNBs.map((gnb, index) => (
              <tr key={index} className="border-t border-slate-800">
                <td className="p-4">{gnb.gnbId}</td>
                <td className="p-4">{gnb.plmn}</td>
                <td className="p-4">{gnb.tac}</td>
                <td className="p-4 text-cyan-400">
                  {gnb.connectedUEs}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      gnb.status === "online"
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {gnb.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow">
      <p className="text-slate-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-cyan-400 mt-2">{value}</h2>
    </div>
  );
}