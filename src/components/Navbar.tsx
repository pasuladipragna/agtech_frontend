import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Wifi, Cpu, Shield, User, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  wsConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ wsConnected = true }) => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>("");
  const logoHref = user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/";

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-emerald-900/30 glass-panel sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link href={logoHref} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform">
            <Cpu className="w-6 h-6 text-black font-bold" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-2">
              AGRI<span className="text-emerald-400">TECH</span> ROVER
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/50 rounded-full">
                SaaS PLATFORM
              </span>
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">Precision Agriculture Autonomous Telemetry Platform</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {/* WebSocket Connection Status Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-900/40 text-xs font-mono">
          <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-emerald-400 animate-pulse glow-emerald" : "bg-red-500"}`} />
          <span className={wsConnected ? "text-emerald-400" : "text-red-400"}>
            {wsConnected ? "MQTT / WS LIVE" : "DISCONNECTED"}
          </span>
        </div>

        {/* Real-time Clock */}
        <div className="hidden md:flex items-center text-xs font-mono text-gray-400 bg-black/30 px-3 py-1.5 rounded-lg border border-emerald-900/20">
          <span>{currentTime || "13:30:00"}</span>
        </div>

        {/* Active User / Role Information */}
        {user ? (
          <div className="flex items-center space-x-3 pl-3 border-l border-emerald-900/30">
            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 font-semibold text-sm">
              {user.role === "admin" ? "AD" : "JD"}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="font-semibold text-gray-200">{user.full_name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  user.role === "admin" ? "bg-red-950 text-red-400 border border-red-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                }`}>
                  {user.role === "admin" ? "SYSTEM ADMIN" : "FARMER ROLE"}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout & Return to SaaS Landing Page"
              className="p-2 rounded-lg bg-red-950/40 border border-red-800/30 hover:bg-red-900/60 text-red-400 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs transition-all shadow-md glow-emerald"
            >
              Portal Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
