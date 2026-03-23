export default function NetworkFunctionStatus() {
  // NFs are always online if containers are running — could fetch /api/status for dynamic state
  const nfs = [
    { name: "AMF", status: "online" },
    { name: "SMF", status: "online" },
    { name: "UPF", status: "online" },
    { name: "NRF", status: "online" },
    { name: "AUSF", status: "online" },
    { name: "UDM", status: "online" },
  ];

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
      <h2 className="text-lg font-semibold text-cyan-400 mb-4">Network Functions Status</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {nfs.map((nf, i) => (
          <div key={i} className="bg-slate-800 p-4 rounded-lg text-center">
            <p className="text-slate-400">{nf.name}</p>
            <p className={`font-semibold mt-1 ${nf.status === "online" ? "text-green-400" : "text-red-400"}`}>
              ● {nf.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}