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
import { ChevronRight, Languages, MessageSquare, Info } from 'lucide-react';
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
    <div className="min-h-screen bg-cream">
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-titleXs font-medium text-primary">Your impact</h2>
                <Select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="h-8 text-sm !py-0 bg-transparent border-none focus:ring-0"
                >
                    <option>February</option>
                    <option>January</option>
                    <option>December</option>
                </Select>
            </div>
            <div className="mb-4">
                <span className="text-displayMd font-medium text-primary mr-2">46kg</span>
                <span className="text-body text-primary-75">Total food offered</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-lime/20 p-3">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-stat font-medium text-primary">131</p>
                        <Info className="h-4 w-4 text-primary-50" />
                    </div>
                    <p className="text-label text-primary-75">Portions offered</p>
                </div>
                 <div className="rounded-lg bg-lime/20 p-3">
                     <div className="flex justify-between items-center mb-1">
                        <p className="text-stat font-medium text-primary">125€</p>
                    </div>
                    <p className="text-label text-primary-75">Saved in food disposal costs</p>
                </div>
                 <div className="rounded-lg bg-lime/20 p-3">
                     <div className="flex justify-between items-center mb-1">
                        <p className="text-stat font-medium text-primary">89%</p>
                         <Info className="h-4 w-4 text-primary-50" />
                    </div>
                    <p className="text-label text-primary-75">Emission reduction</p>
                </div>
            </div>
        </section>

        <section className="rounded-lg bg-base p-4 shadow flex items-center justify-between cursor-pointer hover:bg-primary-10">
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
                    case 'available': return 'bg-positive/10 text-positive';
                    case 'claimed': return 'bg-sky/10 text-info';
                    case 'picked_up': return 'bg-stone text-primary-50';
                    case 'cancelled': return 'bg-rose/10 text-negative';
                    default: return 'bg-stone text-primary-50';
                    }
                })();
                
                return (
                  <div
                    key={donation.id}
                    className="overflow-hidden rounded-lg bg-base shadow transition-shadow hover:shadow-md cursor-pointer"
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
                            'inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
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
    </div>
  );
}