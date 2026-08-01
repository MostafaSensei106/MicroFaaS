'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Box,
  Users,
  Settings,
  LogOut,
  Cloud,
  ChevronDown,
  Globe2,
} from 'lucide-react';
import { useAuth } from '@/src/features/auth/presentation/context/AuthContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Functions', href: '/dashboard/functions', icon: Box, badge: 'FAAS' },
    { label: 'IAM Access', href: '/dashboard/users', icon: Users },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-[240px] bg-[#000000] border-r border-[#272729] flex flex-col justify-between shrink-0 hidden md:flex h-screen sticky top-0 z-50">
      <div>
        {/* Header */}
        <div className="p-5 border-b border-[#272729]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0066cc] flex items-center justify-center shrink-0">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center">
              <h2 className="text-[14px] font-[600] text-white">MicroFaaS</h2>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-[8px] bg-[#272729] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="w-3.5 h-3.5 text-white" />
              <span className="text-[12px] text-white">us-east-1 (Local Engine)</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <div className="text-[12px] font-[400] tracking-[-0.12px] text-[#cccccc] px-3 mb-2">
            Console Navigation
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 min-h-[44px] transition hover:opacity-80 ${
                  isActive
                    ? 'text-[#0066cc] border-l-[2px] border-[#0066cc] -ml-[2px] pl-[14px]'
                    : 'text-white border-l-[2px] border-transparent -ml-[2px] pl-[14px]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0066cc]' : 'text-white'}`} />
                  <span className="text-[12px] font-[400] tracking-[-0.12px]">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-[5px] bg-[#272729] text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-[#272729]">
        <div className="p-3 rounded-lg bg-[#272729] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#0066cc] flex items-center justify-center font-bold text-xs text-white shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'M'}
            </div>
            <div className="overflow-hidden flex flex-col justify-center">
              <p className="text-[14px] font-[600] text-white truncate leading-tight">{user?.name || 'Operator'}</p>
              <p className="text-[12px] text-[#cccccc] capitalize truncate leading-tight">{user?.role || 'developer'}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Log Out"
            className="p-1.5 rounded text-[#cccccc] hover:text-[#ff3b30] transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
