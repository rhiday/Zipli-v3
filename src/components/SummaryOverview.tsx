import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Donation {
  status: string;
}

interface SummaryOverviewProps {
  userId?: string;
  donations: Donation[];
}

const SummaryOverview: React.FC<SummaryOverviewProps> = ({ userId, donations }) => {
  const [activeRequests, setActiveRequests] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from('requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active')
      .then((res: { count?: number }) => {
        setActiveRequests(res.count || 0);
        setLoading(false);
      });
  }, [userId]);

  const activeOffers = donations.filter((d: Donation) => d.status === 'available' || d.status === 'claimed').length;

  return (
    <div className="flex flex-col md:flex-row items-stretch gap-2 md:gap-6 py-4 px-4 bg-base rounded-xl border border-border">
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <span className="text-2xl font-bold text-primary">{activeOffers}</span>
        <span className="text-sm text-primary-75">Active offers</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <span className="text-2xl font-bold text-primary">{loading ? '…' : activeRequests}</span>
        <span className="text-sm text-primary-75">Active requests</span>
      </div>
      <div className="flex-1 flex flex-col justify-end items-center md:items-end py-2">
        <Link href="/donate/all-offers?filter=active" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
          See all
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default SummaryOverview; 