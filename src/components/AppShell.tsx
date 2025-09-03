'use client';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { useDatabase } from '@/store';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import BottomNav from './BottomNav';
import { useLayoutConfig } from '@/hooks/useLayoutConfig';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const init = useDatabase((state) => state.init);
  const { showBottomNav } = useLayoutConfig();

  // Initialize store for all routes (auth routes need it too for DevLoginSwitcher)
  useEffect(() => {
    console.log('🔧 AppShell initializing store...');
    init();
  }, [init]);

  const isAuthRoute = pathname === '/' || pathname.startsWith('/auth');
  const isDocsRoute = pathname.startsWith('/docs');

  return (
    <AuthProvider>
      {isAuthRoute ? (
        <>
          {' '}
          {/* No shell for auth routes but still need store init */}
          {children}
        </>
      ) : isDocsRoute ? (
        /* Full-width layout for documentation pages */
        <div className="min-h-[100svh] bg-gray-50">{children}</div>
      ) : (
        /* Layout: A mobile-like container centered on all screen sizes */
        <div className="min-h-[100svh] bg-cream">
          <div className="relative mx-auto flex h-[100svh] w-full max-w-lg flex-col bg-base shadow-lg">
            {/* Main content container */}
            <main className="flex-grow overflow-y-auto">{children}</main>
            {/* BottomNav is now part of this container and positioned absolutely */}
            {showBottomNav && <BottomNav />}
          </div>
        </div>
      )}
    </AuthProvider>
  );
};

export default AppShell;
