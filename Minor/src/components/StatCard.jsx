export default function StatCard({ title, value }) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md">
      <p className="text-slate-400 text-sm">{title}</p>
      <h2 className="text-3xl font-bold text-cyan-400 mt-2">{value}</h2>
    </div>
  );
}