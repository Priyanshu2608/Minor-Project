const nfs = ["AMF", "SMF", "UPF", "NRF", "AUSF", "UDM"];

export default function NetworkFunctionStatus() {
  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
      <h2 className="text-lg font-semibold text-cyan-400 mb-4">
        Network Functions Status
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {nfs.map((nf, i) => (
          <div key={i} className="bg-slate-800 p-4 rounded-lg text-center">
            <p className="text-slate-400">{nf}</p>
            <p className="text-green-400 font-semibold mt-1">● Online</p>
          </div>
        ))}
      </div>
    </div>
  );
}