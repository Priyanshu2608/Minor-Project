import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/", icon: "📊" },
    { name: "UE Monitor", path: "/ue", icon: "📱" },
    { name: "gNB Monitor", path: "/gnb", icon: "📡" },
    { name: "PDU Sessions", path: "/pdu", icon: "🌐" },
    { name: "Subscribers", path: "/subscribers", icon: "👤" },
    { name: "Grafana Dash", path: "http://localhost:3000", icon: "📈", external: true },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-8">
      <div className="text-cyan-400 font-bold text-xl tracking-tighter">5G Core Dash</div>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          link.external ? (
            <a
              key={link.path}
              href={link.path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg transition-all text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <span>{link.icon}</span>
              <span className="font-medium text-sm">{link.name}</span>
            </a>
          ) : (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                location.pathname === link.path
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <span>{link.icon}</span>
              <span className="font-medium text-sm">{link.name}</span>
            </Link>
          )
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="bg-slate-800/50 p-4 rounded-xl">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">System Load</p>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full w-[15%] rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]" />
          </div>
        </div>
      </div>
    </aside>
  );
}