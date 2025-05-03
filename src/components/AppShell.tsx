'use client';
import { AuthProvider } from '@/components/auth/AuthProvider';
import dynamic from 'next/dynamic';

const DesktopGlobalNavbar = dynamic(() => import('@/components/DesktopGlobalNavbar'), { ssr: false });

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* Render DesktopGlobalNavbar only on medium screens and up */}
      <div className="hidden md:block">
        <DesktopGlobalNavbar />
      </div>
      {children}
    </AuthProvider>
  );
} 