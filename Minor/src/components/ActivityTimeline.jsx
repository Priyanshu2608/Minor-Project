export default function ActivityTimeline() {
  const activities = [
    "UE imsi-001 Connected",
    "PDU Session Activated",
    "Slice SST 1 Assigned",
    "UE imsi-002 Disconnected"
  ];

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
      <h2 className="text-lg font-semibold text-cyan-400 mb-4">
        Activity Timeline
      </h2>

      <ul className="space-y-3 text-sm text-slate-400">
        {activities.map((a, i) => (
          <li key={i} className="border-l-2 border-cyan-400 pl-3">
            {a}
          </li>
        ))}
      </ul>
    </div>
  );
}