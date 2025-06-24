'use client';

import React, { useCallback, useMemo } from 'react';
import { useDatabase } from '@/store/databaseStore';

const DevLoginSwitcher: React.FC = React.memo(() => {
  const { users, login, currentUser } = useDatabase();

  const handleLogin = useCallback(async (user: any) => {
    try {
      const result = await login(user.email, 'password');
      if (result.error) {
        console.error('DevLoginSwitcher: Login failed:', result.error);
      }
    } catch (error) {
      console.error('DevLoginSwitcher: Login error:', error);
    }
  }, [login]);

  const userList = useMemo(() => (
    <ul className="space-y-1">
      {users.map((user) => (
        <li key={user.id || user.email}>
          <button
            className={`w-full text-left px-2 py-1 rounded hover:bg-green-100 transition text-sm ${currentUser?.id === user.id ? 'bg-green-200 font-bold' : ''}`}
            onClick={() => handleLogin(user)}
            disabled={currentUser?.id === user.id}
          >
            {user.full_name} <span className="text-xs text-gray-400">({user.role})</span>
          </button>
        </li>
      ))}
    </ul>
  ), [users, currentUser, handleLogin]);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
      <div className="font-bold mb-2 text-sm text-gray-700">Dev User Switcher</div>
      {userList}
    </div>
  );
});

export default DevLoginSwitcher; 