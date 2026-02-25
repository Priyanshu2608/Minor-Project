import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import FooterBar from "./FooterBar.jsx";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <div className="p-6 overflow-y-auto flex-1">
          <Navbar />
          <Outlet />
        </div>
        <FooterBar />
      </div>
    </div>
  );
}