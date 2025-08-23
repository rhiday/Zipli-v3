'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, Search, ShoppingBag, FileText, BarChart3, Users, LogOut } from 'lucide-react';
import { useDatabase } from '@/store';
import MobileTabLayout from './MobileTabLayout';
import { useCommonTranslation } from '@/lib/i18n-enhanced';

// Desktop Sidebar component
const Sidebar: React.FC = React.memo(() => {
  const pathname = usePathname();
  const { currentUser, logout } = useDatabase();

  const sidebarItems = React.useMemo(() => {
    if (!currentUser) return [];

    const role = currentUser.role;
    
    switch (role) {
      case 'food_donor':
        return [
          { href: '/donate', label: t('common.navigation.dashboard'), icon: LayoutGrid },
          { href: '/donate/new', label: t('common.add_donation'), icon: ShoppingBag },
          { href: '/feed', label: t('common.explore'), icon: Search },
          { href: '/profile', label: t('common.navigation.profile'), icon: Users },
        ];
      case 'food_receiver':
        return [
          { href: '/receiver/dashboard', label: t('common.navigation.dashboard'), icon: LayoutGrid },
          { href: '/request/new', label: t('common.request_food'), icon: FileText },
          { href: '/feed', label: t('common.explore'), icon: Search },
          { href: '/profile', label: t('common.navigation.profile'), icon: Users },
        ];
      case 'city':
        return [
          { href: '/city/dashboard', label: t('common.navigation.dashboard'), icon: LayoutGrid },
          { href: '/city', label: t('common.analytics'), icon: BarChart3 },
          { href: '/feed', label: t('common.overview'), icon: Users },
          { href: '/profile', label: t('common.navigation.profile'), icon: Users },
        ];
      case 'terminals':
        return [
          { href: '/terminal/dashboard', label: t('common.terminal'), icon: LayoutGrid },
          { href: '/feed', label: t('common.overview'), icon: Users },
          { href: '/profile', label: t('common.navigation.profile'), icon: Users },
        ];
      default:
        return [
          { href: '/donate', label: t('common.navigation.dashboard'), icon: LayoutGrid },
          { href: '/feed', label: t('common.explore'), icon: Search },
          { href: '/profile', label: t('common.navigation.profile'), icon: Users },
        ];
    }
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <aside className="hidden lg:block w-64 bg-cloud border-r border-border h-full">
      <div className="flex flex-col h-full">
        {/* User Info */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {currentUser.full_name?.charAt(0) || currentUser.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-primary text-sm">
                {currentUser.full_name  || 'User'}
              </p>
              <p className="text-xs text-secondary capitalize">
                {currentUser.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                      isActive 
                        ? 'bg-lime text-primary font-medium' 
                        : 'text-secondary hover:bg-primary-10 hover:text-primary'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full text-secondary hover:bg-red hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = t('common.sidebar');

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-base flex">
    <Sidebar />
    <main className="flex-1 flex flex-col">
      {children}
    </main>
  </div>
);

export default DashboardLayout; 