'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, isInitialized } = useDatabase();

  useEffect(() => {
    if (isInitialized) {
      if (!currentUser) {
        // No user logged in, redirect to login
        router.push('/auth/login');
      } else {
        // Redirect based on user role
        switch (currentUser.role) {
          case 'food_donor':
            router.push('/donor/dashboard');
            break;
          case 'food_receiver':
            router.push('/receiver/dashboard');
            break;
          case 'city':
            router.push('/city/dashboard');
            break;
          case 'terminals':
            router.push('/terminal/dashboard');
            break;
          default:
            // Fallback to feed if role is unknown
            router.push('/feed');
            break;
        }
      }
    }
  }, [isInitialized, currentUser, router]);

  // Show loading spinner while determining redirect
  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
    </div>
  );
}
