import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Loader2 } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Public pages that don't need the dashboard layout
  const isPublicPage = ['/', '/login', '/register'].includes(router.pathname);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-agri-cream">
        <Loader2 className="h-10 w-10 text-agri-green animate-spin" />
        <span className="ml-3 text-gray-600 font-medium">Loading Smart AgriTech...</span>
      </div>
    );
  }

  // If public page, just render children without sidebar/topbar
  if (isPublicPage) {
    return <main className="min-h-screen bg-agri-cream">{children}</main>;
  }

  // If not authenticated and not on a public page, this will be handled by a route guard
  // But we render nothing while redirecting to avoid layout flash
  if (!isAuthenticated) {
    return null; 
  }

  return (
    <div className="flex h-screen overflow-hidden bg-agri-cream">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Topbar setMobileOpen={setMobileOpen} />
        
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
