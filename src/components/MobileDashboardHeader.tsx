import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/Avatar';
import { Languages, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/supabase/types';
import { useTranslations } from '@/hooks/useTranslations';

// Define ProfileRow using the Database type
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface MobileDashboardHeaderProps {
  profile: ProfileRow | null;
  getInitials: (name?: string | null) => string;
}

export default function MobileDashboardHeader({
  profile, getInitials }: MobileDashboardHeaderProps) {
  const { t } = useTranslations();
  const router = useRouter();
  return (
    <header className="bg-primary p-4 pt-10 text-white relative overflow-hidden md:hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Button variant="secondary" size="sm" className="rounded-full border border-white/50 bg-white/10 hover:bg-white/20 text-white !text-label">
            <Languages className="mr-1.5 h-4 w-4" /> English
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full border border-white/50 bg-white/10 hover:bg-white/20 text-white">
              <MessageSquare className="h-5 w-5" />
            </Button>
            <button onClick={() => router.push('/profile')} className="rounded-full border border-white/50 bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white">
              <Avatar fallback={getInitials(profile?.full_name)} className="!h-9 !w-9 bg-transparent text-white" />
            </button>
          </div>
        </div>
        <p className="text-body font-semibold text-primary-25/80 mb-1">{t.goodToSeeYou}</p>
        <h1 className="text-displayXs font-semibold truncate font-display">
          {profile?.organization_name || profile?.full_name  || 'Donor'}
        </h1>
      </div>
    </header>
  );
} 