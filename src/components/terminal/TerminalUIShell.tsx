'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store';
import { useAuth } from '@/components/auth/AuthProvider';
import { Building2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/Avatar';
import { getInitials } from '@/lib/utils';

interface TerminalUIShellProps {
  children: React.ReactNode;
}

export const TerminalUIShell: React.FC<TerminalUIShellProps> = ({
  children,
}) => {
  const router = useRouter();
  const { currentUser } = useDatabase();

  const handleProfileClick = () => {
    router.push('/terminal/profile');
  };

  const handleContactClick = () => {
    router.push('/contact');
  };

  const userInitials = currentUser
    ? getInitials(currentUser.full_name || currentUser.email)
    : 'U';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <header className="bg-earth px-6 py-4 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left side - Welcome Message */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                Welcome back,{' '}
                {currentUser?.organization_name ||
                  currentUser?.full_name ||
                  'Terminal'}
              </h1>
            </div>
          </div>

          {/* Right side - Navigation Icons */}
          <div className="flex items-center space-x-3">
            {/* Contact Icon */}
            <button
              onClick={handleContactClick}
              className="rounded-full border border-white/50 bg-white/10 hover:bg-white/20 focus:outline-none p-2"
            >
              <MessageSquare className="h-5 w-5 text-white" />
            </button>

            {/* Profile Icon */}
            <button
              onClick={handleProfileClick}
              className="rounded-full border border-white/50 bg-white/10 hover:bg-white/20 focus:outline-none"
            >
              <Avatar
                fallback={userInitials}
                className="!h-9 !w-9 bg-transparent text-white"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default TerminalUIShell;
