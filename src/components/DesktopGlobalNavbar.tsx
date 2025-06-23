'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, Plus, Search, ShoppingBag, FileText, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';

const navItems = [
  { href: '/donate', label: 'Dashboard', icon: LayoutGrid },
  { href: '/feed', label: 'Explore', icon: Search },
  { href: '#', label: 'Add', icon: Plus, isCentral: true },
];

interface DesktopGlobalNavbarProps {
  onAddClick: () => void;
}

export default function DesktopGlobalNavbar({ onAddClick }: DesktopGlobalNavbarProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  if (!user) return null;

  return (
    <nav className="hidden md:flex flex-col items-center w-20 bg-base border-r border-primary-10 py-6">
      {/* Logo at top */}
      <Link href="/" className="mb-8 inline-flex items-center justify-center">
        <h1 className="text-lg font-bold text-primary">Zipli</h1>
      </Link>

      <div className="flex flex-col items-center gap-4 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href && !item.isCentral;

          if (item.isCentral) {
            return (
              <button
                key={item.label}
                onClick={onAddClick}
                className={cn(
                  'inline-flex items-center justify-center w-12 h-12 rounded-lg',
                  'bg-lime text-primary shadow-md hover:bg-lime/90 -mt-2'
                )}
                aria-label={item.label}
              >
                <item.icon className={cn('h-6 w-6')} aria-hidden="true" />
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'inline-flex items-center justify-center w-12 h-12 rounded-lg',
                isActive ? 'bg-cream' : 'hover:bg-primary-10'
              )}
              aria-label={item.label}
            >
              <item.icon
                className={cn(
                  'h-6 w-6',
                  isActive ? 'text-primary' : 'text-primary-50 group-hover:text-primary'
                )}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 