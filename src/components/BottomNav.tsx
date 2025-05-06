'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, Plus, Search, ShoppingBag, FileText, ClipboardList } from 'lucide-react'; // Added ClipboardList
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Added DialogClose
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';

// TODO: Define proper navigation items based on user role
const navItems = [
  { href: '/donate', label: 'Dashboard', icon: LayoutGrid },
  { href: '/feed', label: 'Explore', icon: Search },
  { href: '/request', label: 'Requests', icon: ClipboardList }, // Added Requests link
  { href: '#', label: 'Add', icon: Plus, isCentral: true }, 
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter(); // For navigation from modal buttons

  // TODO: Only render for specific roles or routes if needed

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-[76px] border-t border-primary-10 bg-base shadow-[0_-2px_10px_-5px_rgba(0,0,0,0.1)] md:hidden">
      {/* Adjusted to explicitly handle 4 items + central button for layout purposes */}
      <div className="mx-auto grid grid-cols-5 h-full max-w-lg items-center">
        {navItems.filter(item => !item.isCentral).slice(0, 2).map(renderNavItem)} 
        {navItems.find(item => item.isCentral) && renderNavItem(navItems.find(item => item.isCentral)!, -1)} {/* Render central item */}
        {navItems.filter(item => !item.isCentral).slice(2).map(renderNavItem)}
      </div>
    </nav>
  );

  // Helper function to render nav items to avoid repetition
  function renderNavItem(item: typeof navItems[0], index: number) {
    const isActive = pathname === item.href && !item.isCentral;
    if (item.isCentral) {
      return (
        <Dialog key={item.label}>
          <DialogTrigger asChild>
            <button
              className={cn(
                'group inline-flex flex-col items-center justify-center text-center w-full',
                '-mt-8' 
              )}
            >
              <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-lime text-primary shadow-md group-hover:bg-lime/90">
                <item.icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <span className={cn('text-caption font-medium text-primary')}>
                {item.label}
              </span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-center text-lg font-semibold text-primary">What would you like to do?</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <DialogClose asChild>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full justify-start py-6 text-left" 
                  onClick={() => router.push('/donate/new')}
                >
                  <ShoppingBag className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-primary">Donate or Sell</p>
                    <p className="text-xs text-secondary">Offer food items to others.</p>
                  </div>
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full justify-start py-6 text-left" 
                  onClick={() => router.push('/request/new')}
                >
                  <FileText className="mr-3 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-primary">Request Food</p>
                    <p className="text-xs text-secondary">Create a request for specific items.</p>
                  </div>
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      );
    }
    // Regular nav items
    return (
      <Link
        key={item.label}
        href={item.href}
        className={cn(
          'group inline-flex flex-col items-center justify-center text-center w-full h-full',
          'px-1 hover:bg-primary-10' 
        )}
      >
        <div className={cn(
          "flex flex-col items-center justify-center w-full rounded-lg py-2", 
          isActive ? 'bg-cream' : 'bg-transparent'
        )}>
          <item.icon
            className={cn(
              'mb-1 h-5 w-5 text-primary-50 group-hover:text-primary', 
              isActive && 'text-primary'
            )}
            aria-hidden="true"
          />
          <span className={cn(
            'text-[10px]',
            isActive ? 'text-primary font-semibold' : 'text-primary-50',
            'group-hover:text-primary'
          )}>
            {item.label}
          </span>
        </div>
      </Link>
    );
  }
} 