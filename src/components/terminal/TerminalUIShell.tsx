'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store';
import { useAuth } from '@/components/auth/AuthProvider';
import { User, Settings, LogOut, ChevronDown, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/Avatar';
import { getInitials } from '@/lib/utils';

interface TerminalUIShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const TerminalUIShell: React.FC<TerminalUIShellProps> = ({
  children,
  title = 'Food Terminal Operations Dashboard',
  subtitle = 'Real-time logistics and processing monitoring',
}) => {
  const router = useRouter();
  const { currentUser } = useDatabase();
  const { signOut } = useAuth();

  const handleProfileClick = () => {
    router.push('/terminal/profile');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const userInitials = currentUser
    ? getInitials(currentUser.full_name || currentUser.email)
    : 'U';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left side - Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">{subtitle}</p>
            </div>
          </div>

          {/* Right side - Navigation */}
          <div className="flex items-center space-x-4">
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <Avatar fallback={userInitials} className="w-8 h-8" />
                  <span className="font-medium">
                    {currentUser?.full_name || currentUser?.email || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser?.full_name || 'Terminal User'}
                  </p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {currentUser?.role} Account
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Terminal Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default TerminalUIShell;
