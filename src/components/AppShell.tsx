'use client';
import { AuthProvider } from '@/components/auth/AuthProvider';
import dynamic from 'next/dynamic';

const NavBar = dynamic(() => import('@/components/NavBar'), { ssr: false });

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NavBar />
      {children}
    </AuthProvider>
  );
} 