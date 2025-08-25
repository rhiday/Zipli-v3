'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, Plus, Search, ShoppingBag, FileText, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCommonTranslation } from '@/lib/i18n-enhanced';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";

const navItems = [
  { href: '/donate', label: 'Dashboard', icon: LayoutGrid },
  { href: '/feed', label: 'Explore', icon: Search },
  { href: '#', label: 'Add', icon: Plus, isCentral: true },
];

export default function DesktopGlobalNavbar() {
  const { t } = useCommonTranslation();

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
              <Dialog key={item.label}>
                <DialogTrigger asChild>
                  <button
                    className={cn(
                      'inline-flex items-center justify-center w-12 h-12 rounded-lg',
                      'bg-lime text-primary shadow-md hover:bg-lime/90 -mt-2'
                    )}
                    aria-label={item.label}
                  >
                    <item.icon className={cn('h-6 w-6')} aria-hidden="true" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-base" aria-describedby="add-dialog-description">
                  <DialogHeader>
                    <DialogTitle className="text-center text-lg font-semibold text-primary">What would you like to do?</DialogTitle>
                    <DialogDescription id="add-dialog-description" className="sr-only">
                      Choose to create a new donation or sale listing, or create a new food request.
                    </DialogDescription>
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