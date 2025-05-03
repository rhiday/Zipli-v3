'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import BottomNav from '@/components/BottomNav';
import { ChevronRight, Languages, MessageSquare, Info, ChevronDown } from 'lucide-react';
import { Profile } from '@/lib/supabase/types';

type DonationWithFoodItem = {
  id: string;
  food_item: {
    name: string;
    description: string;
    image_url: string | null;
    expiry_date: string;
  };
  quantity: number;
  status: string;
  pickup_time: string;
  created_at: string;
};

type DonorDashboardData = {
    profile: Profile | null;
    donations: DonationWithFoodItem[];
}

export default function DonorDashboardPage(): React.ReactElement {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DonorDashboardData>({ profile: null, donations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('February');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/auth/login');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<Profile>();
        
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const { data: donationsData, error: donationsError } = await supabase
        .from('donations')
        .select(`
          id,
          quantity,
          status,
          pickup_time,
          created_at,
          food_item:food_items!inner(
            name,
            description,
            image_url,
            expiry_date
          )
        `)
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false })
        .returns<DonationWithFoodItem[]>();

      if (donationsError) throw donationsError;

      setDashboardData({ profile: profileData, donations: donationsData || [] });

    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = dashboardData.donations.filter(donation => {
    const matchesSearch = searchTerm === '' ||
      donation.food_item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.food_item.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  const getInitials = (name?: string | null) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  }

  return (
    <div className="min-h-screen bg-base pb-20">
      <header className="bg-primary p-4 pt-10 text-white relative overflow-hidden">
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
                       <Avatar fallback={getInitials(dashboardData.profile?.full_name)} className="!h-9 !w-9 bg-transparent text-white" />
                    </button>
                </div>
          </div>
            <p className="text-body font-semibold text-primary-25/80 mb-1">Good to see you!</p>
            <h1 className="text-displayXs font-semibold truncate font-display">
                {dashboardData.profile?.organization_name || dashboardData.profile?.full_name || 'Donor'}
            </h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <section>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-titleXs font-medium text-primary">Your impact</h2>
                <button className="inline-flex items-center gap-1 text-primary text-body font-semibold focus:outline-none focus:ring-1 focus:ring-primary rounded-sm px-1">
                    {selectedMonth}
                    <ChevronDown className="h-4 w-4" />
                </button>
            </div>
            <div className="mb-4">
                <span className="text-displayXs font-semibold text-primary mr-2">46kg</span>
                <span className="text-body text-primary-75">Total food offered</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-lime/20 p-3 space-y-1">
                    <div className="flex justify-between items-start">
                        <p className="text-stat font-semibold text-primary">131</p>
                        <button className="p-0.5 text-primary-50 hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-full">
                            <Info className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <p className="text-label text-primary-75">Portions offered</p>
                </div>
                 <div className="rounded-lg bg-lime/20 p-3 space-y-1">
                     <div className="flex justify-between items-start">
                        <p className="text-stat font-semibold text-primary">125€</p>
                         <div className="w-3.5 h-3.5 flex-shrink-0"></div>
                    </div>
                    <p className="text-label text-primary-75">Saved in food disposal costs</p>
                </div>
                 <div className="rounded-lg bg-lime/20 p-3 space-y-1">
                     <div className="flex justify-between items-start">
                        <p className="text-stat font-semibold text-primary">89%</p>
                        <button className="p-0.5 text-primary-50 hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-full">
                            <Info className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <p className="text-label text-primary-75">Emission reduction</p>
                </div>
          </div>
        </section>

        <section className="rounded-lg bg-base p-4 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.04)] border border-primary-10 flex items-center justify-between cursor-pointer hover:bg-primary-10">
           <div>
                <h3 className="text-body font-semibold text-primary mb-1">Export to PDF</h3>
                <p className="text-caption text-primary-75">Environmental and social impact data for reporting, and operation planning.</p>
        </div>
            <ChevronRight className="h-5 w-5 text-primary-50" />
        </section>

        <section>
          <h2 className="text-titleXs font-medium text-primary mb-4">Past offers</h2>
        {error && (
              <div className="mb-6 rounded-md bg-rose/10 p-4 text-body text-negative">
            {error}
          </div>
        )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {dashboardData.donations.length > 0 ? (
              dashboardData.donations.map((donation) => {
                 const statusClass = (() => {
                    switch (donation.status) {
                    case 'available': return 'bg-positive/20 text-positive';
                    case 'claimed': return 'bg-sky/10 text-info';
                    case 'picked_up': return 'bg-stone/70 text-white';
                    case 'cancelled': return 'bg-negative/10 text-negative';
                    default: return 'bg-stone text-primary-50';
                    }
                })();
                
                return (
              <div
                key={donation.id}
                    className="overflow-hidden rounded-lg bg-base shadow-[0_2px_4px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.04)] border border-primary-10 cursor-pointer"
                    onClick={() => router.push(`/donate/${donation.id}`)}
              >
                {donation.food_item.image_url && (
                  <img
                    src={donation.food_item.image_url}
                    alt={donation.food_item.name}
                        className="h-32 w-full object-cover"
                  />
                )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-body font-semibold text-primary line-clamp-1">
                      {donation.food_item.name}
                    </h3>
                        <span
                          className={cn(
                            'inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium capitalize',
                            statusClass
                          )}
                        >
                          {donation.status.replace('_', ' ')}
                    </span>
                  </div>
                      <p className="text-caption text-primary-75 mb-2 line-clamp-2">
                    {donation.food_item.description}
                  </p>
                      <p className="text-caption text-primary-50">
                        Expires: {new Date(donation.food_item.expiry_date).toLocaleDateString()}
                    </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8 bg-base rounded-lg">
                <p className="text-body text-primary-75 mb-4">No past offers found.</p>
                  <Button
                  variant="primary"
                  size="md"
                onClick={() => router.push('/donate/new')}
              >
                  Create Your First Offer
              </Button>
            </div>
          )}
        </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}