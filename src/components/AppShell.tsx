'use client';
import { AuthProvider } from '@/components/auth/AuthProvider';
import React, { useEffect } from 'react';
import BottomNav from './BottomNav';
import { usePathname } from 'next/navigation';
import { useDatabase } from '@/store';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const init = useDatabase(state => state.init);

  // Initialize store for all routes (auth routes need it too for DevLoginSwitcher)
  useEffect(() => {
    console.log('🔧 AppShell initializing store...');
    init();
  }, [init]);

  const isAuthRoute = pathname === '/' || pathname.startsWith('/auth');

  // Hides bottom nav on all pages within the donation creation flow.
  const donationFlowRegex =
    /^\/donate\/(new|manual|pickup-slot|summary|thank-you|detail|[^/]+\/handover-confirm)/;
  const hideBottomNav = donationFlowRegex.test(pathname);

  return (
    <AuthProvider>
      {isAuthRoute ? (
        <> {/* No shell for auth routes but still need store init */}
          {children}
        </>
      ) : (
        /* Layout: A mobile-like container centered on all screen sizes */
        <div className="min-h-screen bg-cream">
          <div className="relative mx-auto flex h-screen w-full max-w-lg flex-col bg-base shadow-lg">
            {/* Main content container */}
            <main className={`flex-grow overflow-y-auto ${!hideBottomNav ? 'pb-[76px]' : ''}`}>
              {children}
            </main>
            {/* BottomNav is now part of this container and positioned absolutely */}
            {!hideBottomNav && <BottomNav />}
          </div>
        </div>
      )}
    </AuthProvider>
  );
};

export default AppShell; 