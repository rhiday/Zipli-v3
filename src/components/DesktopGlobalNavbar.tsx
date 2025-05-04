'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';

const navItems = [
  { href: '/donate', label: 'Dashboard', icon: LayoutGrid },
  { href: '/donate/new', label: 'Add', icon: Plus, isCentral: true },
  { href: '/feed', label: 'Explore', icon: Search },
];

export default function DesktopGlobalNavbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  if (!user) return null;

  const handleLogout = () => {
    signOut();
    router.push('/auth/login');
  };

  return (
    <nav className="hidden md:flex flex-col items-center h-screen w-20 bg-base border-r border-primary-10 py-6">
      {/* Logo at top */}
      <Link href="/" className="mb-8 inline-flex items-center justify-center">
        <h1 className="text-lg font-bold text-primary">Zipli</h1>
      </Link>

      <div className="flex flex-col items-center gap-4 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'inline-flex items-center justify-center w-12 h-12 rounded-lg',
                item.isCentral
                  ? 'bg-lime text-primary shadow-md hover:bg-lime/90 -mt-2'
                  : isActive
                  ? 'bg-cream'
                  : 'hover:bg-primary-10',
              )}
            >
              <item.icon
                className={cn(
                  'h-6 w-6',
                  item.isCentral ? '' : isActive ? 'text-primary' : 'text-primary-50 group-hover:text-primary'
                )}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>

      {/* Logout button at bottom */}
      <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full">
        Logout
      </Button>
    </nav>
  );
} 