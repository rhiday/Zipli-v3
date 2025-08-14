/**
 * Development Authentication Helper
 * 
 * This bypasses Supabase authentication entirely for local development.
 * DO NOT USE IN PRODUCTION!
 */

import { useDatabase } from '@/store';
import type { Profile } from '@/types/supabase';

export const devAuth = {
  /**
   * Quick login for development - bypasses all authentication
   */
  quickLogin: (user: Profile) => {
    console.log('🔑 DevAuth: Quick login for', user.full_name);
    
    // Use localStorage approach - this is the most reliable for development
    const storeData = {
      currentUser: user,
      isInitialized: true,
      loading: false,
      error: null
    };
    
    localStorage.setItem('supabase-database-storage', JSON.stringify({
      state: storeData,
      version: 0
    }));
    
    console.log('✅ DevAuth: User logged in successfully');
    return true;
  },
  
  /**
   * Quick logout for development
   */
  quickLogout: () => {
    console.log('🔑 DevAuth: Quick logout');
    localStorage.removeItem('supabase-database-storage');
    console.log('✅ DevAuth: User logged out');
    return true;
  },
  
  /**
   * Get current user
   */
  getCurrentUser: () => {
    const store = useDatabase.getState();
    return store.currentUser;
  },
  
  /**
   * Check if user is logged in
   */
  isLoggedIn: () => {
    const store = useDatabase.getState();
    return !!store.currentUser;
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).devAuth = devAuth;
  console.log('🔧 DevAuth available in console: window.devAuth');
}