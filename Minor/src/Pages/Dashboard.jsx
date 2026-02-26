import StatCard from "../components/StatCard";
import NetworkFunctionStatus from "../components/NetworkFunctionStatus";
import ActivityTimeline from "../components/ActivityTimeline";
import SlicePanel from "../components/SlicePanel";

export default function Dashboard() {
  const ueDistribution = [
    { name: "eMBB", count: 7, color: "bg-cyan-400" },
    { name: "URLLC", count: 3, color: "bg-green-400" },
    { name: "mMTC", count: 2, color: "bg-purple-400" },
  ];

  const sessionTrend = [
    { slot: "10:00", sessions: 4 },
    { slot: "10:05", sessions: 6 },
    { slot: "10:10", sessions: 5 },
    { slot: "10:15", sessions: 8 },
    { slot: "10:20", sessions: 7 },
    { slot: "10:25", sessions: 10 },
  ];

  const maxSessions = Math.max(...sessionTrend.map((point) => point.sessions));

  const gnbLoad = [
    { name: "gNB-01", load: 72 },
    { name: "gNB-02", load: 54 },
    { name: "gNB-03", load: 88 },
  ];

  const trafficTrend = [32, 40, 35, 52, 47, 61, 58];
  const maxTraffic = Math.max(...trafficTrend);

  return (
    <div className="space-y-10">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard title="Total UEs" value="12" />
        <StatCard title="Connected UEs" value="8" />
        <StatCard title="gNBs" value="3" />
        <StatCard title="Active Sessions" value="10" />
        <StatCard title="Slices" value="2" />
      </div>

      {/* Mock Data Graphs */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold text-cyan-400 mb-5">
            UE Distribution by Slice
          </h2>

          <div className="space-y-4">
            {ueDistribution.map((slice) => {
              const width = (slice.count / 12) * 100;

              return (
                <div key={slice.name}>
                  <div className="flex justify-between text-sm text-slate-300 mb-1">
                    <span>{slice.name}</span>
                    <span>{slice.count} UEs</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full">
                    <div
                      className={`${slice.color} h-3 rounded-full`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold text-cyan-400 mb-5">
            Session Trend
          </h2>

          <div className="h-44 flex items-end gap-3">
            {sessionTrend.map((point) => {
              const height = (point.sessions / maxSessions) * 100;

              return (
                <div key={point.slot} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-800 rounded-t-md h-full flex items-end">
                    <div
                      className="w-full bg-cyan-400 rounded-t-md"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">{point.slot}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold text-cyan-400 mb-5">
            gNB Load Comparison
          </h2>

          <div className="space-y-4">
            {gnbLoad.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                  <span>{item.name}</span>
                  <span>{item.load}%</span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full">
                  <div
                    className="bg-green-400 h-3 rounded-full"
                    style={{ width: `${item.load}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold text-cyan-400 mb-5">
            Uplink Traffic Trend
          </h2>

          <div className="h-44 flex items-end gap-2">
            {trafficTrend.map((value, index) => {
              const height = (value / maxTraffic) * 100;

              return (
                <div key={index} className="flex-1 h-full flex flex-col justify-end">
                  <div
                    className="w-full bg-purple-400 rounded-t-md"
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between text-[11px] text-slate-400">
            <span>T-30m</span>
            <span>Now</span>
          </div>
        </div>
      </div>

      {/* NF + Slice */}
      <div className="grid md:grid-cols-2 gap-6">
        <NetworkFunctionStatus />
        <SlicePanel />
      </div>

      {/* Activity */}
      <ActivityTimeline />
    </div>
  );
}