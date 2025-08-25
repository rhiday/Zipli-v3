'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewRequestPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new request type selection page
    router.replace('/request/select-type');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
    </div>
  );
}
