export default function Navbar() {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-cyan-400">
        5G Core Control Panel
      </h1>

      <div className="flex items-center gap-6 text-sm text-slate-400">
        <span>Auto Refresh: 5s</span>
        <span className="text-green-400 flex items-center gap-2">
          ● System Online
        </span>
      </div>
    </div>
  );
}