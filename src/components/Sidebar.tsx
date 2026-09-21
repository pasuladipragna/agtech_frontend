import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { TERMS } from '../constants/terminology';
import { 
  LayoutDashboard, 
  Map, 
  Leaf, 
  Tractor, 
  Droplets,
  Activity,
  FileText,
  Bell,
  MessageSquare,
  LifeBuoy,
  Users,
  Settings,
  ShieldCheck,
  Package,
  User,
  Cloud
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'ADMIN';
  const prefix = isAdmin ? '/admin' : '/farmer';

  // Navigation config based on distinct role activities
  const farmerNavigation = [
    { name: 'Dashboard', href: `${prefix}/dashboard`, icon: LayoutDashboard },
    { name: 'My Farm', href: `${prefix}/farm`, icon: Map },
    { name: 'Crops', href: `${prefix}/crops`, icon: Leaf },
    { name: 'Rover & Spraying', href: `${prefix}/rover`, icon: Tractor },
    { name: 'Reports', href: `${prefix}/reports`, icon: FileText },
    { name: 'Weather', href: `${prefix}/weather`, icon: Cloud },
    { name: 'Notifications', href: `${prefix}/notifications`, icon: Bell },
    { name: 'Community', href: `${prefix}/community`, icon: MessageSquare },
    { name: 'Support', href: `${prefix}/support`, icon: LifeBuoy },
    { name: 'Profile & Settings', href: `${prefix}/settings`, icon: Settings },
  ];

  const adminNavigation = [
    { name: 'System Dashboard', href: `${prefix}`, icon: LayoutDashboard },
    { name: 'Farmers Management', href: `${prefix}/farmers`, icon: Users },
    { name: 'Rover Fleet', href: `${prefix}/rovers`, icon: Tractor },
    { name: 'Reports & Audit', href: `${prefix}/reports`, icon: FileText },
    { name: 'Broadcast Center', href: `${prefix}/notifications`, icon: Bell },
    { name: 'Support Helpdesk', href: `${prefix}/support`, icon: LifeBuoy },
    { name: 'Community Moderation', href: `${prefix}/community`, icon: MessageSquare },
    { name: 'System Settings', href: `${prefix}/settings`, icon: Settings },
    { name: 'Admin Profile', href: `${prefix}/profile`, icon: User },
  ];

  const navigation = isAdmin ? adminNavigation : farmerNavigation;

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/farmer/dashboard') {
      return router.pathname === href;
    }
    return router.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/80 transition-opacity lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-agri-dark text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center px-6 bg-gray-900">
          <Leaf className="h-8 w-8 text-agri-green mr-3" />
          <span className="font-bold text-xl tracking-tight text-white">Smart AgriTech</span>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
          {isAdmin && (
            <div className="mb-6 px-2">
              <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30">
                ADMINISTRATION
              </span>
            </div>
          )}
          
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                  ${isActive(item.href) 
                    ? 'bg-agri-green text-white' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }
                `}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors
                    ${isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                  `}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
