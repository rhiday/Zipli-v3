'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store';

export default function SodexoDashboard() {
  const router = useRouter();
  const { currentUser, isInitialized } = useDatabase();

  useEffect(() => {
    if (!isInitialized) return;

    if (!currentUser || !['terminals', 'sodexo_admin'].includes(currentUser.role as any)) {
      router.push('/auth/login');
      return;
    }

    // Redirect sodexo_admin to terminal dashboard
    router.push('/terminal/dashboard');
  }, [isInitialized, currentUser, router]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
