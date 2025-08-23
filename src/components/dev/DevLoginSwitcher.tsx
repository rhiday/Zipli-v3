'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import { useDatabase } from '@/store';
import { useCommonTranslation } from '@/lib/i18n-enhanced';

const DevLoginSwitcher: React.FC = React.memo(() => {
  const { users, login, currentUser, fetchUsers, isInitialized, init } =
    useDatabase();

  // Ensure store is initialized and users are fetched
  useEffect(() => {
    if (!isInitialized) {
      init();
    } else if (users.length === 0) {
      fetchUsers();
    }
  }, [isInitialized, users.length, fetchUsers, init]);

  const handleLogin = useCallback(
    async (user: any) => {
      console.log('DevLoginSwitcher: Attempting login for:', user.email);
      try {
        // Use development login method which might be different
        const { setCurrentUser } = useDatabase.getState();
        await setCurrentUser(user.email);
        console.log('DevLoginSwitcher: Login successful for:', user.email);

        // Force a page refresh to ensure proper state
        window.location.href = '/';
      } catch (error) {
        console.error(t('common.devloginswitcher_login_error'), error);

        // Fallback to regular login
        try {
          const result = await login(user.email, 'password');
          if (result.error) {
            console.error('Translation key error',
              result.error
            );
          } else {
            console.log('DevLoginSwitcher: Fallback login successful');
            window.location.href = '/';
          }
        } catch (fallbackError) {
          console.error('Translation key error',
            fallbackError
          );
        }
      }
    },
    [login]
  );

  const userList = useMemo(() => {
    // Sort users by role first, then by organization name
    const sortedUsers = [...users].sort((a, b) => {
      // First sort by role
      const roleOrder = [
        'food_donor',
        'food_receiver',
        'city_dashboard',
        'terminal',
      ];
      const roleA = roleOrder.indexOf(a.role || '');
      const roleB = roleOrder.indexOf(b.role || '');

      if (roleA !== roleB) {
        return roleA - roleB;
      }

      // Then sort by organization name or full name
      const nameA = (a.organization_name || a.full_name || '').toLowerCase();
      const nameB = (b.organization_name || b.full_name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return (
      <ul className="space-y-1 max-h-96 overflow-y-auto">
        {sortedUsers.map((user) => (
          <li key={user.id || user.email}>
            <button
              className={`w-full text-left px-2 py-1 rounded hover:bg-green-100 transition text-sm ${currentUser?.id === user.id ? 'bg-green-200 font-bold' : ''}`}
              onClick={() => handleLogin(user)}
              disabled={currentUser?.id === user.id}
            >
              {user.organization_name || user.full_name}{' '}
              <span className="text-xs text-gray-400">({user.role})</span>
            </button>
          </li>
        ))}
      </ul>
    );
  }, [users, currentUser, handleLogin]);

  // Log state for debugging purposes
  if (process.env.NODE_ENV === 'development') {
    console.log('DevLoginSwitcher: Users loaded:', users.length);
  }

  if (users.length === 0) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
        <div className="font-bold mb-2 text-sm text-gray-700">
          Dev User Switcher
        </div>
        <div className="text-xs text-gray-500">
          No users found. Run{' '}
          <code className="bg-gray-100 px-1 rounded">npm run seed</code> to
          create test users.
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
      <div className="font-bold mb-2 text-sm text-gray-700">
        Dev User Switcher ({users.length} users)
      </div>
      {userList}
    </div>
  );
});

export default DevLoginSwitcher;
