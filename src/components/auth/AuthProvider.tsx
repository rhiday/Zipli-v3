'use client';

/**
 * AuthProvider
 * Provides authentication context and handles user session management
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDatabase, useDatabaseActions } from '@/store/databaseStore';

// We can keep the Supabase types for compatibility if needed, or create our own
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: any; // Using `any` for now to match our mock user structure
  session: Session | null; // Session is not mocked, so it can remain null
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser, isInitialized } = useDatabase();
  const { logout } = useDatabaseActions();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We are no longer loading from Supabase, but from our store.
    // We are "loading" until the store is initialized.
    if (isInitialized) {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const handleSignOut = async () => {
    logout();
    // No need to call supabase.auth.signOut() anymore
  };

  const value = {
    user: currentUser,
    session: null, // No real session in mock mode
    isLoading: isLoading,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};