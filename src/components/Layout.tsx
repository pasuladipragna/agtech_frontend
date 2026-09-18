import React from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import Link from "next/link";
import { useRouter } from "next/router";
import { LayoutDashboard, Radio, Navigation, ScanEye, Droplets, LifeBuoy } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#070b09] text-gray-100 flex flex-col">
      <Navbar wsConnected={true} />

      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-20 md:pb-6">
          {children}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-emerald-900/40 flex items-center justify-around z-50 px-2 bg-[#070b09]/95 backdrop-blur-md">
        {[
          { label: "Home", icon: LayoutDashboard, href: "/dashboard" },
          { label: "Rover", icon: Radio, href: "/rover" },
          { label: "Mission", icon: Navigation, href: "/missions" },
          { label: "AI Vision", icon: ScanEye, href: "/vision" },
          { label: "Spraying", icon: Droplets, href: "/spraying" },
          { label: "Support", icon: LifeBuoy, href: "/support" }
        ].map((item) => {
          const isActive = router.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 py-1 px-2 rounded-lg text-[10px] ${
                isActive ? "text-emerald-400 font-bold" : "text-gray-400"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-emerald-400" : "text-gray-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
