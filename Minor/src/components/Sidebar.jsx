import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800">
      <div className="p-5 text-xl font-bold text-cyan-400 border-b border-slate-800">
        5G Core Monitor
      </div>

      <nav className="p-4 space-y-4">
        <Link to="/" className="block hover:text-cyan-400">
          📊 Dashboard
        </Link>
        <Link to="/ue" className="block hover:text-cyan-400">
          👤 UE Management
        </Link>
        <Link to="/pdu" className="block hover:text-cyan-400">
          🌐 PDU Sessions
        </Link>
        <Link to="/gnb" className="block hover:text-cyan-400">
          📡 gNB Monitor
        </Link>
      </nav>
    </aside>
  );
}