import React, { useState, useRef, useEffect } from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen, Bell, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TERMS } from '../constants/terminology';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface TopbarProps {
  setMobileOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export default function Topbar({ setMobileOpen, sidebarCollapsed, setSidebarCollapsed }: TopbarProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isAdmin = user?.role === 'ADMIN';
  const prefix = isAdmin ? '/admin' : '/farmer';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div className="fixed top-0 left-0 right-0 z-30 flex h-16 flex-shrink-0 bg-white border-b border-agri-beige shadow-sm lg:static lg:z-auto">
      <button
        type="button"
        className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-agri-green lg:hidden hover:bg-gray-50"
        onClick={() => setMobileOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="hidden lg:flex items-center justify-center border-r border-gray-200 px-4 text-gray-500 hover:bg-gray-50 hover:text-agri-green focus:outline-none focus:ring-2 focus:ring-inset focus:ring-agri-green"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </button>
      
      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center">
          {/* Breadcrumb or Page title could go here if managed globally */}
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          <button
            type="button"
            className="rounded-full bg-white p-1 text-gray-400 hover:text-agri-green focus:outline-none focus:ring-2 focus:ring-agri-green focus:ring-offset-2 transition-colors"
            title={TERMS.notifications}
            onClick={() => router.push(`${prefix}/notifications`)}
          >
            <span className="sr-only">View {TERMS.notifications}</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Profile dropdown */}
          <div className="relative ml-3" ref={dropdownRef}>
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="flex flex-col items-end hidden sm:block">
                <span className="text-sm font-medium text-gray-700 group-hover:text-agri-green transition-colors">{user?.full_name}</span>
                <span className="text-xs text-gray-500 capitalize">{user?.role.toLowerCase()}</span>
              </div>
              <button
                type="button"
                className="flex max-w-xs items-center rounded-full bg-agri-cream text-sm focus:outline-none focus:ring-2 focus:ring-agri-green focus:ring-offset-2 ring-1 ring-agri-beige"
                title="Profile menu"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-9 w-9 rounded-full flex items-center justify-center bg-agri-green/10 text-agri-green">
                  <UserIcon className="h-5 w-5" />
                </div>
              </button>
            </div>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Link 
                  href={`${prefix}/profile`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  <UserIcon className="mr-3 h-4 w-4 text-gray-400" />
                  Profile
                </Link>
                <Link 
                  href={`${prefix}/settings`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings className="mr-3 h-4 w-4 text-gray-400" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="mr-3 h-4 w-4 text-red-500" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

