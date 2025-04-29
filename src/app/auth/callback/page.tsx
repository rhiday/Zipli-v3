'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/supabase/types';

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
              router.push('/dashboard');
              break;
            default:
              router.push('/dashboard');
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-800">Processing</h1>
        <p className="mt-2 text-gray-600">
          Please wait while we complete your authentication...
        </p>
        <div className="mt-6 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-green-700"></div>
        </div>
      </div>
    </div>
  );
} 