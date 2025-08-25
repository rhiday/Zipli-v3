'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      // Process the callback
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (error) {
        console.error('Auth callback error:', error);
        router.push('/auth/login');
        return;
      }

      if (data?.session) {
        // If it's a password reset, redirect to reset password page
        if (type === 'recovery') {
          router.push('/auth/reset-password');
          return;
        }

        // Get user's role and redirect accordingly
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();

        if (profile) {
          const role = profile.role as Database['public']['Enums']['user_role'];
          switch (role) {
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
              console.warn(
                `Unknown user role: ${profile.role}, redirecting to feed.`
              );
              router.push('/feed');
          }
          return;
        }
      }

      // If we don't have a session, redirect to login
      router.push('/auth/login');
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-base p-8 shadow-lg text-center">
        <h1 className="text-titleSm font-display text-primary">Processing</h1>
        <p className="mt-2 text-body text-primary-75">
          Please wait while we complete your authentication...
        </p>
        <div className="mt-6 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
}
