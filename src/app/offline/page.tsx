'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      if (online) {
        toast({
          title: 'Connection restored',
          description: 'All features are now available',
          variant: 'success',
        });

        // Redirect to home after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    };

    // Initial check
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [router]);

  const handleRetry = () => {
    if (navigator.onLine) {
      router.push('/');
    } else {
      toast({
        title: 'Still offline',
        description: 'Please check your internet connection',
        variant: 'warning',
      });
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-earth rounded-full flex items-center justify-center">
            <span className="text-2xl text-base">📱</span>
          </div>
          <h1 className="text-2xl font-semibold text-primary mb-2">
            {isOnline ? 'Connection Restored!' : "You're Offline"}
          </h1>
          <p className="text-primary/80">
            {isOnline
              ? 'Redirecting you back to the app...'
              : 'Some features are not available without an internet connection. Please check your connection and try again.'}
          </p>
        </div>

        {isOnline ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-earth"></div>
            <span className="ml-2 text-earth">Reconnecting...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <Button onClick={handleRetry} className="w-full">
              Try Again
            </Button>

            <div className="text-sm text-primary/60 space-y-2">
              <p className="font-medium">Limited offline features:</p>
              <ul className="text-left list-disc list-inside space-y-1">
                <li>View cached donation listings</li>
                <li>Access saved preferences</li>
                <li>View offline help content</li>
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
