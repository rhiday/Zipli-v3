'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token hash from URL
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const next = searchParams.get('next') || '/';

        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });

          if (error) throw error;

          // Redirect to the dashboard or specified next URL
          router.push(next);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during email confirmation');
      }
    };

    handleEmailConfirmation();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Email Confirmation</h1>
          {error ? (
            <>
              <p className="mt-2 text-red-600">{error}</p>
              <button
                onClick={() => router.push('/auth/login')}
                className="mt-4 text-green-600 hover:text-green-500"
              >
                Return to login
              </button>
            </>
          ) : (
            <p className="mt-2 text-gray-600">Verifying your email...</p>
          )}
        </div>
      </div>
    </div>
  );
} 