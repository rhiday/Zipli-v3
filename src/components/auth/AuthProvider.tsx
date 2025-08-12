'use client';

/**
 * AuthProvider
 * Provides authentication context and handles user session management
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDatabase } from '@/store/databaseStore';
import type { User } from '@/store/databaseStore';
import { supabase } from '@/lib/supabase/client';

// We can keep the Supabase types for compatibility if needed, or create our own
import { Session } from '@supabase/supabase-js';

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (isInitialized) {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (event === 'SIGNED_OUT') {
        logout();
        router.push('/auth/login');
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Load user profile when signed in
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const user: User = {
            id: profile.id,
            email: profile.email,
            role: profile.role,
            full_name: profile.full_name,
            organization_name: profile.organization_name,
            contact_number: profile.contact_number,
            address: profile.address,
            driver_instructions: profile.driver_instructions,
          };
          // Update the store with the current user
          useDatabase.getState().updateUser(user);
          useDatabase.setState({ currentUser: user });
        }
      }
      
      setIsLoading(false);
    });

    if (isInitialized) {
      setIsLoading(false);
    }

    return () => subscription.unsubscribe();
  }, [isInitialized, logout, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    logout();
    router.push('/auth/login');
  };

  const value = {
    user: currentUser,
    session: session,
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