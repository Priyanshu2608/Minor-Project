import StatCard from "../components/StatCard";
import NetworkFunctionStatus from "../components/NetworkFunctionStatus";
import ActivityTimeline from "../components/ActivityTimeline";
import SlicePanel from "../components/SlicePanel";

export default function Dashboard() {
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