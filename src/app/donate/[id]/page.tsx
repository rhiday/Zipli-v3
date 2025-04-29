'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { Donation, FoodItem } from '@/lib/supabase/types';
import { DonationWithFoodItemResponse } from '@/lib/supabase/responses';

type DonationWithFoodItem = Donation & {
  food_item: FoodItem;
};

export default function DonationDetailPage(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const [state, setState] = useState<DonationWithFoodItemResponse>({
    data: null,
    error: null,
    loading: true
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchDonation();
    }
  }, [params.id]);

  const fetchDonation = async () => {
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
        .eq('id', params.id)
        .single();

      setState({ data: data as DonationWithFoodItem, error: null, loading: false });
    } catch (err: any) {
      setState({ data: null, error: err.message, loading: false });
    }
  };

  const handleStatusUpdate = async (newStatus: 'available' | 'claimed' | 'picked_up' | 'cancelled') => {
    try {
      setActionLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { error } = await supabase
        .from('donations')
        .update({ status: newStatus })
        .eq('id', params.id)
        .eq('donor_id', user.id);

      if (error) throw error;
      await fetchDonation();
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message }));
    } finally {
      setActionLoading(false);
    }
  };

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-green-700"></div>
      </div>
    );
  }

  if (state.error || !state.data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {state.error || 'Donation not found'}
        </div>
      </div>
    );
  }

  const donation = state.data;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Donation Details</h1>
          <Button
            onClick={() => router.push('/donate')}
            variant="outline"
            className="border-green-700 text-green-700 hover:bg-green-50"
          >
            Back to Donations
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          {donation.food_item.image_url && (
            <div className="aspect-video w-full">
              <img
                src={donation.food_item.image_url}
                alt={donation.food_item.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                {donation.food_item.name}
              </h2>
              <span className={`rounded-full px-3 py-1 text-sm capitalize ${
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

            <p className="text-gray-600">{donation.food_item.description}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="font-medium text-gray-700">Quantity</h3>
                <p className="text-gray-600">{donation.quantity}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Expiry Date</h3>
                <p className="text-gray-600">
                  {new Date(donation.food_item.expiry_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {donation.status === 'available' && (
              <div className="flex space-x-4">
                <Button
                  onClick={() => handleStatusUpdate('cancelled')}
                  variant="destructive"
                  disabled={actionLoading}
                  className="flex-1"
                >
                  Cancel Donation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}