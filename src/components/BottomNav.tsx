'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, Plus, Search } from 'lucide-react'; // Example icons

// TODO: Define proper navigation items based on user role
const navItems = [
  { href: '/donate', label: 'Dashboard', icon: LayoutGrid },
  { href: '/donate/new', label: 'Add', icon: Plus, isCentral: true },
  { href: '/feed', label: 'Explore', icon: Search }, // Explore might link to /feed for donors?
];

export default function BottomNav() {
  const pathname = usePathname();

  // TODO: Only render for specific roles or routes if needed

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-primary-10 bg-base shadow-[0_-2px_10px_-5px_rgba(0,0,0,0.1)] md:hidden">
      <div className="mx-auto grid h-16 max-w-lg grid-cols-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'group inline-flex flex-col items-center justify-center px-5',
                item.isCentral ? '-mt-4' : 'hover:bg-primary-10' // Style central button differently
              )}
            >
              {item.isCentral ? (
                <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-lime text-primary shadow-md group-hover:bg-lime/90">
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </div>
              ) : (
                <item.icon
                  className={cn(
                    'mb-1 h-6 w-6 text-primary-50 group-hover:text-primary',
                    isActive && 'text-primary'
                  )}
                  aria-hidden="true"
                />
              )}
              <span
                className={cn(
                  'text-caption',
                  isActive ? 'text-primary' : 'text-primary-50',
                  item.isCentral ? 'font-medium text-primary' : 'group-hover:text-primary'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 