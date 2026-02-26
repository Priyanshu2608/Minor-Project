export default function UEPage() {

  const mockUEs = [
    { supi: "imsi-001", state: "connected", gnb: 100 },
    { supi: "imsi-002", state: "idle", gnb: 101 },
    { supi: "imsi-003", state: "connected", gnb: 100 },
  ];

  const ueStateBreakdown = [
    {
      name: "Connected",
      count: mockUEs.filter((ue) => ue.state === "connected").length,
      color: "bg-green-400",
    },
    {
      name: "Idle",
      count: mockUEs.filter((ue) => ue.state === "idle").length,
      color: "bg-yellow-400",
    },
  ];

  const totalUes = mockUEs.length || 1;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">
        UE Management
      </h1>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-cyan-400 mb-5">
          UE State Distribution
        </h2>

        <div className="space-y-4">
          {ueStateBreakdown.map((item) => {
            const width = (item.count / totalUes) * 100;

            return (
              <div key={item.name}>
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span>{item.name}</span>
                  <span>{item.count}</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full">
                  <div
                    className={`${item.color} h-3 rounded-full`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800">
            <tr>
              <th className="p-4">SUPI</th>
              <th className="p-4">State</th>
              <th className="p-4">gNB</th>
            </tr>
          </thead>
          <tbody>
            {mockUEs.map((ue, index) => (
              <tr key={index} className="border-t border-slate-800">
                <td className="p-4">{ue.supi}</td>
                <td className="p-4">
                  <span className={
                    ue.state === "connected"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }>
                    {ue.state}
                  </span>
                </td>
                <td className="p-4">{ue.gnb}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}