'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, Plus, Search, ShoppingBag, FileText, BarChart3, Users } from 'lucide-react';
import { useDatabase } from '@/store/databaseStore';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from '@/components/ui/button';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useDatabase();

  // Define navigation items based on user role
  const navItems = useMemo(() => {
    if (!currentUser) return [];

    const role = currentUser.role;
    
    switch (role) {
      case 'food_donor':
        return [
          { href: '/donate', label: 'Dashboard', icon: LayoutGrid },
          { href: '#', label: 'Add', icon: Plus, isCentral: true }, 
          { href: '/feed', label: 'Explore', icon: Search },
        ];
      case 'food_receiver':
        return [
          { href: '/receiver/dashboard', label: 'Dashboard', icon: LayoutGrid },
          { href: '#', label: 'Request', icon: Plus, isCentral: true }, 
          { href: '/feed', label: 'Explore', icon: Search },
        ];
      case 'city':
        return [
          { href: '/city/dashboard', label: 'Dashboard', icon: LayoutGrid },
          { href: '/city', label: 'Analytics', icon: BarChart3 },
          { href: '/feed', label: 'Overview', icon: Users },
        ];
      case 'terminals':
        return [
          { href: '/terminal/dashboard', label: 'Terminal', icon: LayoutGrid },
          { href: '/feed', label: 'Overview', icon: Users },
        ];
      default:
        return [
          { href: '/donate', label: 'Dashboard', icon: LayoutGrid },
          { href: '#', label: 'Add', icon: Plus, isCentral: true }, 
          { href: '/feed', label: 'Explore', icon: Search },
        ];
    }
  }, [currentUser]);

  // Only render for authenticated users and exclude admin pages
  if (!currentUser || pathname.includes('/admin/') || pathname.includes('/auth/')) {
    return null;
  }

  return (
    <nav className="absolute bottom-0 left-0 z-50 w-full h-[76px] border-t border-primary-10 bg-base shadow-[0_-2px_10px_-5px_rgba(0,0,0,0.1)]">
      {/* Adjusted grid to 3 columns for Dashboard, Add, Explore */}
      <div className="mx-auto grid grid-cols-3 h-full max-w-lg items-center">
        {navItems.map((item, index) => renderNavItem(item, index))} 
      </div>
    </nav>
  );

  // Helper function to render nav items to avoid repetition
  function renderNavItem(item: typeof navItems[0], index: number) {
    const isActive = pathname === item.href && !item.isCentral;
    if (item.isCentral) {
      return (
        <Drawer key={item.label}>
          <DrawerTrigger asChild>
            <button
              className={cn(
                'group inline-flex flex-col items-center justify-center text-center w-full',
                '-mt-8' 
              )}
              aria-label={item.label}
            >
              <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-lime text-primary shadow-md group-hover:bg-lime/90">
                <item.icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <span className={cn('text-caption font-medium text-primary')}>
                {item.label}
              </span>
            </button>
          </DrawerTrigger>
          <DrawerContent className="bg-base">
            <DrawerHeader className="text-center">
              <DrawerTitle className="text-lg font-semibold text-primary">What would you like to do?</DrawerTitle>
            </DrawerHeader>
            <div className="grid gap-3 p-4">
              {currentUser?.role === 'food_receiver' ? (
                <DrawerClose asChild>
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="w-full justify-start py-5 text-left"
                    onClick={() => router.push('/request/new')}
                  >
                    <FileText className="mr-3 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-primary">Request Food</p>
                      <p className="text-xs text-secondary">Create a request for specific items.</p>
                    </div>
                  </Button>
                </DrawerClose>
              ) : currentUser?.role === 'city' ? (
                <>
                  <DrawerClose asChild>
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="w-full justify-start py-5 text-left"
                      onClick={() => router.push('/city/dashboard')}
                    >
                      <BarChart3 className="mr-3 h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold text-primary">View Analytics</p>
                        <p className="text-xs text-secondary">Monitor city-wide food sustainability.</p>
                      </div>
                    </Button>
                  </DrawerClose>
                </>
              ) : (
                <>
                  <DrawerClose asChild>
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="w-full justify-start py-5 text-left"
                      onClick={() => router.push('/donate/new')}
                    >
                      <ShoppingBag className="mr-3 h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold text-primary">Donate Food</p>
                        <p className="text-xs text-secondary">Offer food items to others.</p>
                      </div>
                    </Button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="w-full justify-start py-5 text-left"
                      onClick={() => router.push('/request/new')}
                    >
                      <FileText className="mr-3 h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold text-primary">Request Food</p>
                        <p className="text-xs text-secondary">Create a request for specific items.</p>
                      </div>
                    </Button>
                  </DrawerClose>
                </>
              )}
            </div>
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button variant="ghost" size="sm">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    }
    // Regular nav items (Dashboard, Explore)
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