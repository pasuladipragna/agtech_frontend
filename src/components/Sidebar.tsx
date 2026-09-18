import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, Navigation, Radio, ScanEye, Droplets, BarChart3,
  MessageSquare, LifeBuoy, ShieldAlert, Cpu
} from "lucide-react";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard", adminOnly: false },
  { label: "Rover Remote Control", icon: Radio, href: "/rover", adminOnly: false },
  { label: "Mission Planner", icon: Navigation, href: "/missions", adminOnly: false },
  { label: "AI Vision Lab", icon: ScanEye, href: "/vision", adminOnly: false },
  { label: "Precision Spraying", icon: Droplets, href: "/spraying", adminOnly: false },
  { label: "Analytics & Reports", icon: BarChart3, href: "/analytics", adminOnly: false },
  { label: "Farmer Forum", icon: MessageSquare, href: "/community", adminOnly: false },
  { label: "Support Tickets", icon: LifeBuoy, href: "/support", adminOnly: false },
  { label: "Admin Panel", icon: ShieldAlert, href: "/admin", adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <aside className="w-64 glass-panel border-r border-emerald-900/30 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-emerald-500 uppercase">
          Navigation Menu
        </div>

        {navItems.filter(item => !item.adminOnly || isAdmin).map((item) => {
          const isActive = router.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-emerald-950 to-emerald-900/60 text-emerald-300 border border-emerald-600/40 shadow-md shadow-emerald-950 glow-emerald"
                  : "text-gray-400 hover:text-white hover:bg-emerald-950/30"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-gray-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/30 text-xs text-gray-400 space-y-2">
        <div className="flex items-center justify-between text-emerald-400 font-semibold text-[11px]">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" /> ROVER-4WD-01
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-900/60 text-[9px] text-emerald-300">HAL OK</span>
        </div>
        <div className="text-[10px] text-gray-400 leading-relaxed">
          4WD DC Motors | Spray Pump | Solenoid Valve | Height Mechanism | GPS
        </div>
      </div>
    </aside>
  );
};
