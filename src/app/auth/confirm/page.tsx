'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/supabase/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ConfirmPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token hash from URL
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });

          if (error) throw error;

          // Get user's role from profiles
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not found');

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;

          // Redirect based on role
          const role = profile.role as UserRole;
          switch (role) {
            case 'food_donor':
              router.push('/donate');
              break;
            case 'food_receiver':
              router.push('/feed');
              break;
            case 'terminals':
            case 'city':
            default:
              router.push('/dashboard');
          }
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during email confirmation');
      }
    };

    handleEmailConfirmation();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-base p-8 shadow-lg text-center">
        <h1 className="text-titleSm font-display text-primary">Email Confirmation</h1>
        {error ? (
          <>
            <p className="mt-2 text-body text-negative">Error: {error}</p>
            <Button onClick={() => router.push('/auth/login')} variant="secondary" size="md" className="mt-4">
              Return to login
            </Button>
          </>
        ) : (
          <p className="mt-2 text-body text-primary-75">Verifying your email...</p>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-4">
        <div className="w-full max-w-md space-y-6 rounded-lg bg-base p-8 shadow-lg text-center">
          <h1 className="text-titleSm font-display text-primary">Email Confirmation</h1>
          <p className="mt-2 text-body text-primary-75">Loading...</p>
          <div className="mt-6 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          </div>
        </div>
      </div>
    }>
      <ConfirmPageContent />
    </Suspense>
  );
} 