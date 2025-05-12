'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';
import { DonationWithFoodItemResponse } from '@/lib/supabase/responses';
import { cn } from '@/lib/utils';

type DonationRow = Database['public']['Tables']['donations']['Row'];
type FoodItemRow = Database['public']['Tables']['food_items']['Row'];

type DonationWithFoodItem = DonationRow & {
  food_item: FoodItemRow & {
    food_type?: string | null;
  };
  pickup_time: string;
  instructions_for_driver: string;
};

export default function DonationDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const [state, setState] = useState<DonationWithFoodItemResponse>({
    data: null,
    error: null,
    loading: true
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchDonation();
    }
  }, [params.id]);

  const fetchDonation = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          instructions_for_driver,
          food_item:food_items(*)
        `)
        .eq('id', params.id)
        .single<DonationWithFoodItem>();

      if (error) throw error;

      setState({ data, error: null, loading: false });
    } catch (err: any) {
      console.error("Fetch Donation Error:", err);
      setState({ data: null, error: err.message || 'Failed to load donation details.', loading: false });
    }
  };

  const handleStatusUpdate = async (newStatus: 'available' | 'claimed' | 'picked_up' | 'cancelled') => {
    if (!state.data) return;
    
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
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .eq('donor_id', user.id);

      if (error) throw error;
      await fetchDonation();
      if (newStatus === 'cancelled') {
        router.push('/donate');
      }
    } catch (err: any) {
      console.error("Update Status Error:", err);
      setState(prev => ({ ...prev, error: err.message || 'Failed to update status.' }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimDonation = async () => {
    if (!state.data || !currentUserId) return;

    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('donations')
        .update({ status: 'claimed', receiver_id: currentUserId, updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .eq('status', 'available')
        .neq('donor_id', currentUserId);

      if (error) throw error;
      await fetchDonation();
    } catch (err: any) {
      console.error("Claim Donation Error:", err);
      setState(prev => ({ ...prev, error: err.message || 'Failed to claim donation.' }));
    } finally {
      setActionLoading(false);
    }
  };

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (state.error || !state.data) {
    return (
      <div className="min-h-screen bg-cream p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-lg bg-rose/10 p-4 text-body text-negative">
          {state.error || 'Donation not found'}
        </div>
        <div className="mt-4 text-center">
            <Button variant="secondary" onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const donation = state.data;

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
    <div className="min-h-screen bg-cream p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="mr-2 p-2 h-9 w-9 text-primary hover:bg-primary/10 rounded-lg flex items-center justify-center"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-titleMd font-display text-primary">Donation Details</h1>
          </div>
          <Button
            onClick={() => router.push('/donate')}
            variant="secondary"
            size="sm"
          >
            Back to Donations
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg bg-base shadow">
          {donation.food_item.image_url && (
            <div className="aspect-video w-full bg-primary-10">
              <img
                src={donation.food_item.image_url}
                alt={donation.food_item.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-titleSm font-semibold text-primary">
                {donation.food_item.name}
              </h2>
              <span
                  className={cn(
                      'inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium capitalize',
                      statusClass
                  )}
              >
                {donation.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-body text-primary-75">{donation.food_item.description || <span className="italic text-primary-50">No description provided.</span>}</p>

            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <div>
                <h3 className="mb-1 text-label font-medium text-primary-75">Quantity</h3>
                <p className="text-body text-primary">{donation.quantity}</p>
              </div>
              <div>
                 <h3 className="mb-1 text-label font-medium text-primary-75">Pickup Time</h3>
                 <p className="text-body text-primary">
                    {Array.isArray(donation.pickup_slots) && donation.pickup_slots.length > 0 && donation.pickup_slots[0] && typeof donation.pickup_slots[0] === 'object' && 'start' in donation.pickup_slots[0] && 'end' in donation.pickup_slots[0]
                      ? (() => {
                          const slot = donation.pickup_slots[0] as { start: string; end: string };
                          const date = donation.pickup_time ? new Date(donation.pickup_time) : null;
                          const dateStr = date ? date.toLocaleDateString() : '';
                          return `Pickup: ${dateStr}, ${slot.start}–${slot.end}`;
                        })()
                      : (donation.pickup_time
                          ? `Pickup: ${new Date(donation.pickup_time).toLocaleDateString()}, ${new Date(donation.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`
                          : <span className="italic text-primary-50">Not specified</span>
                        )}
                 </p>
              </div>
              <div>
                <h3 className="mb-1 text-label font-medium text-primary-75">Food Type</h3>
                <p className="text-body text-primary">
                  {donation.food_item.food_type || <span className="italic text-primary-50">Not specified</span>}
                </p>
              </div>
            </div>

            {donation.instructions_for_driver && (
              <div>
                <h3 className="mb-1 text-label font-medium text-primary-75">Instructions for Driver</h3>
                <p className="text-body text-primary whitespace-pre-wrap">{donation.instructions_for_driver}</p>
              </div>
            )}
            
            <div className="flex space-x-4 border-t border-primary-10 pt-5">
              {donation.status === 'available' && currentUserId === donation.donor_id && (
                <Button
                  onClick={() => handleStatusUpdate('cancelled')}
                  variant="negative"
                  size="md"
                  disabled={actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? 'Cancelling...' : 'Cancel Donation'}
                </Button>
              )}
              {donation.status === 'available' && currentUserId && currentUserId !== donation.donor_id && (
                <Button
                  onClick={handleClaimDonation}
                  variant="primary"
                  size="md"
                  disabled={actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? 'Claiming...' : 'Claim Food'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}