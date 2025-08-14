'use client';

import React, { useEffect } from 'react';
import { useDatabase } from '@/store';
import { useRouter } from 'next/navigation';

/**
 * Simple DevLogin Component - Just works!
 * No fancy features, just click and login.
 */
export default function DevLoginSimple() {
  const router = useRouter();
  const store = useDatabase();
  const { users, currentUser, isInitialized, loading, error, fetchUsers } = store;
  
  console.log('DevLoginSimple state:', { 
    usersCount: users.length, 
    isInitialized, 
    loading, 
    error,
    currentUser: currentUser?.full_name 
  });
  
  // Force fetch users if none loaded
  useEffect(() => {
    if (users.length === 0 && !loading) {
      console.log('🔄 DevLoginSimple fetching users directly...');
      fetchUsers();
    }
  }, [users.length, loading, fetchUsers]);

  const handleQuickLogin = (user: any) => {
    console.log('Quick login for:', user.email);
    
    // Simple approach: Just set the user directly in localStorage
    // and update the store state
    const storeData = {
      currentUser: user,
      isInitialized: true
    };
    
    // Save to localStorage (this is what the store persistence uses)
    localStorage.setItem('supabase-database-storage', JSON.stringify({
      state: storeData,
      version: 0
    }));
    
    // Force a page reload to pick up the new user
    window.location.href = user.role === 'food_donor' ? '/donate' : 
                          user.role === 'food_receiver' ? '/feed' : '/';
  };

  if (users.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
        <p className="text-sm">No users loaded yet...</p>
        {error && <p className="text-xs text-red-500 mt-1">Error: {error}</p>}
        {loading && <p className="text-xs text-blue-500 mt-1">Loading...</p>}
        {!isInitialized && <p className="text-xs text-gray-500 mt-1">Not initialized</p>}
        <button 
          onClick={() => {
            console.log('📲 Manual fetch users triggered');
            fetchUsers();
          }}
          className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          Load Users
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-3">
      <h3 className="font-bold text-sm mb-2">Dev User Switcher ({users.length} users)</h3>
      
      {currentUser && (
        <div className="text-xs text-green-600 mb-2">
          Current: {currentUser.full_name}
        </div>
      )}
      
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {users.slice(0, 10).map((user) => (
          <button
            key={user.id}
            onClick={() => handleQuickLogin(user)}
            className="w-full text-left px-2 py-1 text-xs rounded hover:bg-blue-50 border border-transparent hover:border-blue-200 transition"
          >
            <div className="flex justify-between">
              <span className="font-medium">{user.full_name}</span>
              <span className="text-gray-400">({user.role})</span>
            </div>
          </button>
        ))}
      </div>
      
      {currentUser && (
        <button
          onClick={() => {
            localStorage.removeItem('supabase-database-storage');
            window.location.href = '/auth/login';
          }}
          className="mt-2 text-xs text-red-500 hover:underline"
        >
          Logout
        </button>
      )}
    </div>
  );
}