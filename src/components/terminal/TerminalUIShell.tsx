'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useRouter, usePathname } from 'next/navigation';
import { useDatabase } from '@/store';
import { useAuth } from '@/components/auth/AuthProvider';
import { useCommonTranslation } from '@/hooks/useTranslations';
import {
  Building2,
  MessageSquare,
  LayoutGrid,
  LifeBuoy,
  Route as RouteIcon,
  Activity,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn, getInitials } from '@/lib/utils';

interface TerminalUIShellProps {
  children: React.ReactNode;
}

export const TerminalUIShell: React.FC<TerminalUIShellProps> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useDatabase();
  const { t } = useCommonTranslation();

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
    <div className="min-h-screen bg-cloud flex flex-col">
      {/* Desktop Header */}
      {/* Header spans full width; logo sits flush to the far left */}
      <header className="bg-earth text-white">
        <div className="flex items-center justify-between py-4 pl-2 pr-4 md:px-6">
          {/* Left side - Logo space */}
          <div className="flex items-center space-x-3">
            {/* Logo area */}
            <div className="h-8 w-28 md:w-32 flex items-center">
              <Image
                src="/zipli-logo.svg"
                alt="Zipli"
                width={112}
                height={28}
                priority
                className="object-contain w-auto h-7 md:h-8"
              />
            </div>
          </div>

          {/* Right side - Language + Navigation Icons */}
          <div className="flex items-center space-x-3">
            <LanguageSwitcher compact />
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

      {/* Main Content with Left Navigation */}
      <div className="flex-1 flex">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terminal/dashboard"
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                    pathname === '/terminal/dashboard'
                      ? 'bg-lime text-green-900 font-medium'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-900'
                  )}
                >
                  <LayoutGrid className="w-5 h-5" />
                  <span>{t('dashboard')}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terminal/matching"
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                    pathname === '/terminal/matching'
                      ? 'bg-lime text-green-900 font-medium'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-900'
                  )}
                >
                  <Activity className="w-5 h-5" />
                  <span>{t('matching')}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terminal/routes"
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                    pathname === '/terminal/routes'
                      ? 'bg-lime text-green-900 font-medium'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-900'
                  )}
                >
                  <RouteIcon className="w-5 h-5" />
                  <span>{t('routes')}</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terminal/crm"
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                    pathname === '/terminal/crm'
                      ? 'bg-lime text-green-900 font-medium'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-900'
                  )}
                >
                  <Building2 className="w-5 h-5" />
                  <span>CRM</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terminal/viesti"
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                    pathname === '/terminal/viesti'
                      ? 'bg-lime text-green-900 font-medium'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-900'
                  )}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Viesti</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terminal/help"
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                    pathname === '/terminal/help'
                      ? 'bg-lime text-green-900 font-medium'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-900'
                  )}
                >
                  <LifeBuoy className="w-5 h-5" />
                  <span>{t('help')}</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main content area */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default TerminalUIShell;
