'use client';
import { AuthProvider } from '@/components/auth/AuthProvider';
import dynamic from 'next/dynamic';
import DevLoginSwitcher from './dev/DevLoginSwitcher';

const NavBar = dynamic(() => import('@/components/NavBar'), { ssr: false });

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NavBar />
      {children}
      {process.env.NODE_ENV === 'development' && <DevLoginSwitcher />}
    </AuthProvider>
  );
} 