'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { PlusIcon, SearchIcon, FilterIcon } from 'lucide-react';

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

export default function DonorDashboardPage(): React.ReactElement {
  const router = useRouter();
  const [donations, setDonations] = useState<DonationWithFoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDonations();
  }, [statusFilter]);

  const fetchDonations = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        router.push('/auth/login');
        return;
      }

      let query = supabase
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
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.returns<DonationWithFoodItem[]>();
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
      donation.food_item.description.toLowerCase().includes(searchTerm.toLowerCase());

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
          <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/donate/new')}
              className="bg-green-700 hover:bg-green-600"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              Create New Donation
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search donations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="claimed">Claimed</option>
            <option value="picked_up">Picked Up</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {donation.food_item.name}
                    </h3>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      donation.status === 'available' ? 'bg-green-100 text-green-800' :
                      donation.status === 'claimed' ? 'bg-blue-100 text-blue-800' :
                      donation.status === 'picked_up' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {donation.status.replace('_', ' ').charAt(0).toUpperCase() + donation.status.slice(1)}
                    </span>
                  </div>
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
                      <span className="font-medium">Pickup:</span>{' '}
                      {new Date(donation.pickup_time).toLocaleString()}
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
                  : 'No donations available'}
              </p>
              <Button
                onClick={() => router.push('/donate/new')}
                className="mt-4 bg-green-700 hover:bg-green-600"
              >
                Create Your First Donation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}