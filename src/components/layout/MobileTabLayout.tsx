'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
// Placeholder icons - replace with your actual icon library (e.g., lucide-react)
import { LayoutDashboard, PlusCircle, Compass } from 'lucide-react'; 

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/donate/new', label: 'Add', icon: PlusCircle }, // Assuming '/donate/new' for Add
  { href: '/feed', label: 'Explore', icon: Compass }, // Assuming '/feed' for Explore
];

export default function MobileTabLayout() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 flex justify-around items-center h-16 bg-base shadow-md md:hidden"> 
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={clsx(
              "flex flex-col items-center justify-center text-xs px-2 py-1 rounded-full transition-colors w-20 h-10",
              isActive 
                ? "bg-primary text-white" 
                : "text-inactive hover:text-primary hover:bg-cloud"
            )}
          >
            <Icon className="h-5 w-5 mb-0.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
} 