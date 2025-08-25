'use client';

/**
 * Legacy Login Page
 * Note: This is now redirecting to the new auth/login page
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new login page
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-green-700"></div>
    </div>
  );
}
