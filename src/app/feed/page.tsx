'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { SearchIcon, FilterIcon } from 'lucide-react';

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
  pickup_time_start: string;
  pickup_time_end: string;
  created_at: string;
};

export default function FeedPage(): React.ReactElement {
  const router = useRouter();
  const [donations, setDonations] = useState<DonationFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDonations();
  }, [filter]);

  const fetchDonations = async () => {
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
          pickup_time_start,
          pickup_time_end,
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
        .returns<DonationFeed[]>();

      if (error) throw error;
      setDonations(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = searchTerm === '' ||
      donation.food_item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.food_item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.donor.organization_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Available Donations</h1>
          <div className="flex gap-4">
            <div className="relative flex-1 sm:min-w-[300px]">
              <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDonations.length > 0 ? (
            filteredDonations.map((donation) => (
              <div
                key={donation.id}
                className="overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-md"
              >
                {donation.food_item.image_url && (
                  <img
                    src={donation.food_item.image_url}
                    alt={donation.food_item.name}
                    className="h-48 w-full object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {donation.food_item.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {donation.food_item.description}
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Quantity:</span> {donation.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Expires:</span>{' '}
                      {new Date(donation.food_item.expiry_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Donor:</span>{' '}
                      {donation.donor.organization_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Location:</span>{' '}
                      {donation.donor.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Pickup:</span>{' '}
                      {new Date(donation.pickup_time_start).toLocaleTimeString()} -{' '}
                      {new Date(donation.pickup_time_end).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push(`/donate/${donation.id}`)}
                    className="mt-4 w-full bg-green-700 hover:bg-green-600"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center">
              <p className="text-gray-600">
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