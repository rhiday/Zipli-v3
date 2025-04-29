'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Donation, FoodItem } from '@/lib/supabase/types';
import { DonationsListResponse } from '@/lib/supabase/responses';

type DonationWithFoodItem = Donation & {
  food_item: FoodItem;
};

export default function DonationsPage(): React.ReactElement {
  const router = useRouter();
  const [state, setState] = useState<DonationsListResponse>({
    data: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    fetchDonations();
  }, []);

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
          *,
          food_item:food_items(*)
        `)
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false });

      setState({ data: data as DonationWithFoodItem[], error: null, loading: false });
    } catch (err: any) {
      setState({ data: null, error: err.message, loading: false });
    }
  };

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">My Donations</h1>
          <Button
            onClick={() => router.push('/donate/new')}
            className="bg-green-700 hover:bg-green-600"
          >
            New Donation
          </Button>
        </div>

        {state.error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {!state.data || state.data.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center shadow">
            <p className="text-gray-500">No donations yet. Start by creating a new donation!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {state.data.map((donation) => (
              <div
                key={donation.id}
                className="cursor-pointer overflow-hidden rounded-lg bg-white shadow transition hover:shadow-md"
                onClick={() => router.push(`/donate/${donation.id}`)}
              >
                {donation.food_item.image_url && (
                  <div className="aspect-video w-full">
                    <img
                      src={donation.food_item.image_url}
                      alt={donation.food_item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">
                    {donation.food_item.name}
                  </h3>
                  <p className="mb-2 text-sm text-gray-600">
                    {donation.food_item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Quantity: {donation.quantity}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs capitalize ${
                      donation.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : donation.status === 'claimed'
                        ? 'bg-blue-100 text-blue-800'
                        : donation.status === 'picked_up'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {donation.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}