'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/supabase/types';
import { useDatabaseActions } from '@/store/databaseStore';
type UserRole = Database['public']['Enums']['user_role'];

const testUsers = {
  donor: { email: 'donor@zipli.test', password: 'password', role: 'food_donor' as UserRole },
  sodexoHelsinki: { email: 'helsinki.airport@sodexo.com', password: 'password', role: 'food_donor' as UserRole },
  redCross: { email: 'helsinki.community@redcross.org', password: 'password', role: 'food_receiver' as UserRole },
  receiver: { email: 'receiver@zipli.test', password: 'password', role: 'food_receiver' as UserRole },
  city: { email: 'city@zipli.test', password: 'password', role: 'city' as UserRole },
  terminal: { email: 'terminal@zipli.test', password: 'password', role: 'terminals' as UserRole },
};

export default function DevLoginSwitcher() {
  const router = useRouter();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { setCurrentUser } = useDatabaseActions();

  const handleDevLogin = (roleKey: keyof typeof testUsers) => {
    const user = testUsers[roleKey];
    setLoading(roleKey);
    setError(null);

    console.log(`Bypassing Supabase login. Simulating login for: ${roleKey}`);
    setCurrentUser(user.email);

    // Simulate a short delay for UX, then redirect
    setTimeout(() => {
      // Redirect based on role
      switch (user.role) {
        case 'food_donor':
          router.push('/donate');
          break;
        case 'food_receiver':
          router.push('/feed');
          break;
        case 'city':
        case 'terminals':
        default:
          router.push('/dashboard');
          break;
      }
      setLoading(null);
    }, 500);
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
        {(Object.keys(testUsers) as Array<keyof typeof testUsers>)
          .filter(key => key === 'donor' || key === 'sodexoHelsinki' || key === 'redCross' || key === 'terminal')
          .map((key) => (
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