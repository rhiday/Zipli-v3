'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { SearchIcon } from 'lucide-react';

type DonationFeed = {
  id: string;
  food_item: {
    name: string;
    description: string;
    image_url: string | null;
    expiry_date: string;
  };
  quantity: number;
  status: string;
  donor: {
    organization_name: string;
    address: string;
  };
  pickup_time: string;
  created_at: string;
};

export default function FeedPage(): React.ReactElement {
  const router = useRouter();
  const [donations, setDonations] = useState<DonationFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabase
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
          ),
          donor:profiles!donations_donor_id_fkey!inner(
            organization_name,
            address
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .returns<DonationFeed[]>();

      if (error) throw error;
      setDonations(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch donations.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = searchTerm === '' ||
      donation.food_item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.food_item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (donation.donor?.organization_name && donation.donor.organization_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-titleLg font-display text-primary">Available Donations</h1>
          <div className="flex gap-4">
            <div className="relative flex-1 sm:min-w-[300px]">
              <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-50" />
              <Input
                type="text"
                placeholder="Search by item, description, or donor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-rose/10 p-4 text-body text-negative">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDonations.length > 0 ? (
            filteredDonations.map((donation) => (
              <div
                key={donation.id}
                className="overflow-hidden rounded-lg bg-base shadow transition-shadow hover:shadow-md"
              >
                {donation.food_item.image_url && (
                  <img
                    src={donation.food_item.image_url}
                    alt={donation.food_item.name}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-titleXs font-semibold text-primary">
                    {donation.food_item.name}
                  </h3>
                  <p className="mt-2 text-body text-primary-75">
                    {donation.food_item.description}
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-primary-75">
                      <span className="font-medium text-primary">Quantity:</span> {donation.quantity}
                    </p>
                    <p className="text-sm text-primary-75">
                      <span className="font-medium text-primary">Expires:</span>{' '}
                      {new Date(donation.food_item.expiry_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-primary-75">
                      <span className="font-medium text-primary">Donor:</span>{' '}
                      {donation.donor?.organization_name || 'N/A'}
                    </p>
                    <p className="text-sm text-primary-75">
                      <span className="font-medium text-primary">Location:</span>{' '}
                      {donation.donor?.address || 'N/A'}
                    </p>
                    <p className="text-sm text-primary-75">
                      <span className="font-medium text-primary">Pickup:</span>{' '}
                      {new Date(donation.pickup_time).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => router.push(`/donate/${donation.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-body text-primary-75">
                {searchTerm
                  ? 'No donations match your search criteria'
                  : 'No donations available at the moment'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 