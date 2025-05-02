'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/lib/supabase/types';

const testUsers = {
  donor: { email: 'donor@zipli.test', password: 'password', role: 'food_donor' },
  receiver: { email: 'receiver@zipli.test', password: 'password', role: 'food_receiver' },
  city: { email: 'city@zipli.test', password: 'password', role: 'city' },
  terminal: { email: 'terminal@zipli.test', password: 'password', role: 'terminals' },
};

export default function DevLoginSwitcher() {
  const router = useRouter();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleDevLogin = async (roleKey: keyof typeof testUsers) => {
    const user = testUsers[roleKey];
    setLoading(roleKey);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });

      if (loginError) throw loginError;

      if (data.user) {
        // Redirect based on role (simplified from login page)
        switch (user.role) {
          case 'food_donor': router.push('/donate'); break;
          case 'food_receiver': router.push('/feed'); break;
          case 'city':
          case 'terminals':
          default: router.push('/dashboard'); break;
        }
        // Force reload to ensure state clears if needed
        router.refresh(); 
      } else {
        throw new Error('Dev login failed, user data not found.');
      }
    } catch (err: any) {
      console.error('Dev Login Error:', err);
      setError(`Failed to log in as ${roleKey}: ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 p-4 bg-gray-800 bg-opacity-80 text-white rounded-lg shadow-lg space-y-2 max-w-xs"
      style={{ backdropFilter: 'blur(5px)' }}
    >
      <h4 className="text-sm font-semibold border-b border-gray-600 pb-1 mb-2">Dev Quick Login</h4>
      {error && <p className="text-xs text-red-400 break-words">Error: {error}</p>}
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(testUsers) as Array<keyof typeof testUsers>).map((key) => (
          <Button 
            key={key}
            size="sm"
            variant="secondary"
            onClick={() => handleDevLogin(key)}
            disabled={loading === key}
            className="text-xs capitalize bg-gray-700 hover:bg-gray-600 text-white"
          >
            {loading === key ? 'Logging in...' : key}
          </Button>
        ))}
      </div>
    </div>
  );
} 