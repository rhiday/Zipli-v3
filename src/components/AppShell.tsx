'use client';
import { AuthProvider } from '@/components/auth/AuthProvider';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import Header from './layout/Header'; // Assuming Header might be part of AppShell
import BottomNav from './BottomNav'; // Assuming BottomNav might be part of AppShell
import { usePathname, useRouter } from 'next/navigation';
import { logger } from '../../lib/logger';
import { useDatabase } from '@/store/databaseStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from './ui/button';
import { FileText, ShoppingBag } from 'lucide-react';
// Or import whatever components are actually used in AppShell

const DesktopGlobalNavbar = dynamic(() => import('@/components/DesktopGlobalNavbar'), { ssr: false });

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const init = useDatabase(state => state.init);
  const [isWhatWouldYouLikeToDoOpen, setIsWhatWouldYouLikeToDoOpen] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  const isAuthRoute = pathname === '/' || pathname.startsWith('/auth');
  const hideBottomNav = pathname.startsWith('/donate/new') || pathname.startsWith('/donate/manual');
  
  const handleAddClick = () => {
    setIsWhatWouldYouLikeToDoOpen(true);
  }

  const handleDialogClose = () => {
    setIsWhatWouldYouLikeToDoOpen(false);
  }

  const handleNavigate = (path: string) => {
    router.push(path);
    handleDialogClose();
  }

  return (
    <AuthProvider>
      {isAuthRoute ? (
        <> {/* No sidebar for auth routes */}
          {children}
        </>
      ) : (
        /* Layout: flex container on md for sidebar + content */
        <div className="min-h-screen bg-cream md:flex">
          {/* Sidebar for desktop */}
          <DesktopGlobalNavbar onAddClick={handleAddClick} />
          {/* Main content container */}
          <div className="flex flex-col flex-1">
            {/* Optional Header if global */}
            {/* <Header /> */}
            <main className="flex-grow px-0 pb-[76px] md:pb-0">
              {children}
            </main>
            {!hideBottomNav && <BottomNav />}
          </div>
        </div>
      )}
       <Dialog open={isWhatWouldYouLikeToDoOpen} onOpenChange={setIsWhatWouldYouLikeToDoOpen}>
          <DialogContent className="sm:max-w-md bg-base flex flex-col items-center justify-center" aria-describedby="add-dialog-description">
            <DialogHeader>
              <DialogTitle className="text-center text-lg font-semibold text-primary">What would you like to do?</DialogTitle>
              <DialogDescription id="add-dialog-description" className="sr-only">
                Choose to create a new donation or sale listing, or create a new food request.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 w-full">
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full justify-start py-6 text-left" 
                onClick={() => handleNavigate('/donate/new')}
              >
                <ShoppingBag className="mr-3 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-primary">Donate or Sell</p>
                  <p className="text-xs text-secondary">Offer food items to others.</p>
                </div>
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full justify-start py-6 text-left" 
                onClick={() => handleNavigate('/request/new')}
              >
                <FileText className="mr-3 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-primary">Request Food</p>
                  <p className="text-xs text-secondary">Create a request for specific items.</p>
                </div>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    </AuthProvider>
  );
};

export default AppShell; 