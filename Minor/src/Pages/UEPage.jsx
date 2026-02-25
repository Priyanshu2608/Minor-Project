export default function UEPage() {

  const mockUEs = [
    { supi: "imsi-001", state: "connected", gnb: 100 },
    { supi: "imsi-002", state: "idle", gnb: 101 },
    { supi: "imsi-003", state: "connected", gnb: 100 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">
        UE Management
      </h1>

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