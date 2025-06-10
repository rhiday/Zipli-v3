'use client';
import { AuthProvider } from '@/components/auth/AuthProvider';
import dynamic from 'next/dynamic';
import React from 'react';
import Header from './layout/Header'; // Assuming Header might be part of AppShell
import BottomNav from './BottomNav'; // Assuming BottomNav might be part of AppShell
import { usePathname } from 'next/navigation';
import { logger } from '../../lib/logger';
// Or import whatever components are actually used in AppShell

const DesktopGlobalNavbar = dynamic(() => import('@/components/DesktopGlobalNavbar'), { ssr: false });

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const isAuthRoute = pathname === '/' || pathname.startsWith('/auth');
  
  return (
    <AuthProvider>
      {isAuthRoute ? (
        <> {/* No sidebar for auth routes */}
          {children}
        </>
      ) : (
        /* Layout: flex container on md for sidebar + content */
        <div className="min-h-screen bg-cream md:flex">
          {/* Sidebar for desktop */}
          <DesktopGlobalNavbar />
          {/* Main content container */}
          <div className="flex flex-col flex-1">
            {/* Optional Header if global */}
            {/* <Header /> */}
            <main className="flex-grow px-0 pb-[76px] md:pb-0">
              {children}
            </main>
            {/* <BottomNav /> Removed globally as per request */}
          </div>
        </div>
      )}
    </AuthProvider>
  );
};

export default AppShell; 