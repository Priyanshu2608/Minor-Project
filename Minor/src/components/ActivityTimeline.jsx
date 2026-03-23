export default function ActivityTimeline({ ues = [], pdus = [] }) {
  // Build activity events from live UE + PDU data
  const events = [];

  ues.forEach((ue) => {
    const supi = ue.supi?.replace("imsi-", "") || "unknown";
    if (ue.cm_state === "connected") events.push(`UE ${supi} — Connected`);
    else events.push(`UE ${supi} — Idle`);
  });

  pdus.forEach((s) => {
    events.push(`PDU Session PSI-${s.psi} ${s.pdu_state === "active" ? "Active" : "Inactive"} — DNN: ${s.dnn}`);
  });

  const displayEvents = events.length > 0 ? events.slice(0, 8) : [
    "Waiting for core activity...",
  ];

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
      <h2 className="text-lg font-semibold text-cyan-400 mb-4">Activity Timeline</h2>
      <ul className="space-y-3 text-sm text-slate-400">
        {displayEvents.map((a, i) => (
          <li key={i} className="border-l-2 border-cyan-400 pl-3">{a}</li>
        ))}
      </ul>
    </div>
  );
}