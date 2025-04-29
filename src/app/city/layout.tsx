'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Redirect /city to /city/dashboard
    if (window.location.pathname === '/city') {
      router.push('/city/dashboard');
    }
  }, [router]);

  return <>{children}</>;
} 