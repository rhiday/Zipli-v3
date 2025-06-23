'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/supabase/types';
import { useDatabase } from '@/store/databaseStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const users = useDatabase(state => state.users);
  const currentUser = useDatabase(state => state.currentUser);
  const setCurrentUser = useDatabase(state => state.setCurrentUser);
  const [loggingInAs, setLoggingInAs] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!loggingInAs || !currentUser) return;

    const targetEmail = testUsers[loggingInAs as keyof typeof testUsers]?.email;

    if (currentUser.email === targetEmail) {
      switch (currentUser.role) {
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
      setLoggingInAs(null);
    }
  }, [currentUser, loggingInAs, router]);

  const handleDevLogin = (roleKey: keyof typeof testUsers) => {
    const user = testUsers[roleKey];
    setError(null);
    console.log(`Bypassing Supabase login. Simulating login for: ${roleKey}`);
    setLoggingInAs(roleKey);
    setCurrentUser(user.email);
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
            disabled={loggingInAs === key}
            className="text-xs capitalize bg-gray-700 hover:bg-gray-600 text-white"
          >
            {loggingInAs === key ? 'Logging in...' : key}
          </Button>
        ))}
      </div>
    </div>
  );
} 