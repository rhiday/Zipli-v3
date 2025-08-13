'use client';

/**
 * AuthProvider
 * Provides authentication context and handles user session management
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDatabase } from '@/store';
import type { User } from '@/store';

// We can keep the Supabase types for compatibility if needed, or create our own
import { Session } from '@supabase/supabase-js';

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextType {
  user: User | null;
  session: any;
  isLoading: boolean;
  signOut: () => Promise<void> | void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}) => {
  const currentUser = useDatabase(state => state.currentUser);
  const isInitialized = useDatabase(state => state.isInitialized);
  const logout = useDatabase(state => state.logout);
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const handleSignOut = () => {
    logout();
    router.push('/auth/login');
  };

  const value = {
    user: currentUser,
    session: null, // No real session in mock mode
    isLoading: isLoading,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};