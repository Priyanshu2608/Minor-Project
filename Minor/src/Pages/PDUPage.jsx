import { useState } from "react";

export default function PDUPage() {
  const mockSessions = [
    {
      supi: "imsi-001",
      psi: 1,
      dnn: "internet",
      ip: "10.45.0.12",
      sst: 1,
      sd: "ffffff",
      qos: 9,
      state: "active",
    },
    {
      supi: "imsi-002",
      psi: 2,
      dnn: "ims",
      ip: "10.45.0.15",
      sst: 2,
      sd: "aaaaaa",
      qos: 5,
      state: "inactive",
    },
  ];

  const [filter, setFilter] = useState("all");

  const stateBreakdown = [
    {
      name: "Active",
      value: mockSessions.filter((session) => session.state === "active").length,
      color: "bg-green-400",
    },
    {
      name: "Inactive",
      value: mockSessions.filter((session) => session.state === "inactive").length,
      color: "bg-yellow-400",
    },
  ];

  const maxStateValue = Math.max(...stateBreakdown.map((item) => item.value), 1);

  const filtered = mockSessions.filter((s) =>
    filter === "all" ? true : s.state === filter
  );

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cyan-400">
          PDU Session Monitor
        </h1>

        <select
          className="bg-slate-800 border border-slate-700 text-white px-3 py-1 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <StatCard title="Total Sessions" value={mockSessions.length} />
        <StatCard
          title="Active"
          value={mockSessions.filter(s => s.state === "active").length}
        />
        <StatCard
          title="Inactive"
          value={mockSessions.filter(s => s.state === "inactive").length}
        />
        <StatCard title="Unique Slices" value="2" />
      </div>

      {/* Session State Graph */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-cyan-400 mb-5">
          Session State Distribution
        </h2>

        <div className="h-44 flex items-end gap-6">
          {stateBreakdown.map((item) => {
            const height = (item.value / maxStateValue) * 100;

            return (
              <div key={item.name} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
                <div className="w-full bg-slate-800 rounded-t-md h-full flex items-end">
                  <div
                    className={`${item.color} w-full rounded-t-md`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-xs text-slate-300">{item.name} ({item.value})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="p-4">SUPI</th>
              <th className="p-4">PSI</th>
              <th className="p-4">DNN</th>
              <th className="p-4">IP</th>
              <th className="p-4">Slice</th>
              <th className="p-4">5QI</th>
              <th className="p-4">State</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((session, index) => (
              <tr key={index} className="border-t border-slate-800">
                <td className="p-4">{session.supi}</td>
                <td className="p-4">{session.psi}</td>
                <td className="p-4">{session.dnn}</td>
                <td className="p-4 text-cyan-400">{session.ip}</td>
                <td className="p-4">
                  SST {session.sst} / {session.sd}
                </td>
                <td className="p-4">{session.qos}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      session.state === "active"
                        ? "bg-green-600 text-white"
                        : "bg-yellow-600 text-white"
                    }`}
                  >
                    {session.state}
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

/* Small Reusable Card Component Inside Same File */
function StatCard({ title, value }) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow">
      <p className="text-slate-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-cyan-400 mt-2">{value}</h2>
    </div>
  );
}