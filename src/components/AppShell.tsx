'use client';
import { AuthProvider } from '@/components/auth/AuthProvider';
import dynamic from 'next/dynamic';

const NavBar = dynamic(() => import('@/components/NavBar'), { ssr: false });

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* Render NavBar only on medium screens and up */}
      <div className="hidden md:block">
        <NavBar />
      </div>
      {children}
    </AuthProvider>
  );
} 