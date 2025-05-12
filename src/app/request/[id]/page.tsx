'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { UsersIcon, CalendarIcon, ClockIcon, CheckIcon, XIcon, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type RequestDetail = {
  id: string;
  description: string;
  people_count: number;
  pickup_date: string;
  pickup_start_time: string;
  pickup_end_time: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  user_id: string;
  user: {
    email: string;
  } | null;
  pickup_instructions?: string;
};

export default function RequestDetailPage({ params }: { params: { id: string } }): React.ReactElement {
  const router = useRouter();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchRequest();
    }
  }, [params.id]);

  const checkUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user) {
      setUser(user);
    }
  };

  const fetchRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          id, description, people_count, pickup_date, pickup_start_time, pickup_end_time, status, created_at, user_id,
          pickup_instructions,
          user:profiles(email)
        `)
        .eq('id', params.id)
        .single<RequestDetail>();

      if (error) throw error;
      setRequest(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load request details.');
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'completed' | 'cancelled') => {
    if (!user || !request) {
      setError('Cannot update status: User or Request data missing.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', params.id);

      if (error) throw error;

      await fetchRequest();
    } catch (err: any) {
      setError(err.message || 'Failed to update request status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <XIcon className="mb-4 h-12 w-12 text-negative" />
        <h1 className="text-titleMd font-display text-primary">Request Not Found</h1>
        <p className="mt-2 text-body text-primary-75">
          {error || 'This request may have been removed or doesn\'t exist.'}
        </p>
        <Button
          variant="secondary"
          size="md"
          onClick={() => router.back()}
          className="mt-6"
        >
          Go Back
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === request.user_id;
  const canTakeAction = request.status === 'active';

  const statusClass = (() => {
    switch (request.status) {
      case 'active': return 'bg-positive/10 text-positive';
      case 'completed': return 'bg-stone text-primary-50';
      case 'cancelled': return 'bg-rose/10 text-negative';
      default: return 'bg-stone text-primary-50';
    }
  })();

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="mr-2 p-2 h-9 w-9 text-primary hover:bg-primary/10 rounded-lg flex items-center justify-center"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-titleMd font-display text-primary">
            Request Details
          </h1>
        </div>

        {error && !loading && (
          <div className="rounded-md bg-rose/10 p-4 text-body text-negative">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-lg bg-base shadow">
          <div className="p-6 md:p-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span
                className={cn(
                  'inline-block w-fit whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium capitalize',
                  statusClass
                )}
              >
                {request.status}
              </span>
              <span className="text-caption text-primary-50">
                Created {new Date(request.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="mb-6 space-y-4">
              <p className="text-bodyLg text-primary">{request.description}</p>

              <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2 md:grid-cols-3">
                <div className="flex items-center space-x-2 text-body text-primary-75">
                  <UsersIcon className="h-5 w-5 flex-shrink-0 text-primary-50" />
                  <span>For {request.people_count} people</span>
                </div>
                <div className="flex items-center space-x-2 text-body text-primary-75">
                  <CalendarIcon className="h-5 w-5 flex-shrink-0 text-primary-50" />
                  <span>{new Date(request.pickup_date + 'T00:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
                </div>
                <div className="flex items-center space-x-2 text-body text-primary-75">
                  <ClockIcon className="h-5 w-5 flex-shrink-0 text-primary-50" />
                  <span>From {request.pickup_start_time} to {request.pickup_end_time}</span>
                </div>
              </div>
            </div>

            {request.pickup_instructions && (
              <div className="mb-6 pt-4 border-t border-primary-10">
                <h2 className="mb-1 text-label font-semibold text-primary">Pickup Instructions</h2>
                <p className="text-body text-primary-75 whitespace-pre-wrap">{request.pickup_instructions}</p>
              </div>
            )}

            {request.user && (
              <div className="mb-6 rounded-md border border-primary-10 bg-primary-10/50 p-4">
                <h2 className="mb-1 text-label font-semibold text-primary">Requester Information</h2>
                <p className="text-body text-primary-75">{request.user.email}</p>
              </div>
            )}

            {isOwner && canTakeAction && (
              <div className="flex flex-col gap-3 sm:flex-row sm:space-x-4 border-t border-primary-10 pt-6">
                <Button
                  onClick={() => handleStatusUpdate('completed')}
                  variant="primary"
                  size="md"
                  className="flex-1"
                  disabled={actionLoading}
                >
                  <CheckIcon className="mr-2 h-4 w-4" />
                  {actionLoading ? 'Updating...' : 'Mark as Fulfilled'}
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('cancelled')}
                  variant="negative"
                  size="md"
                  className="flex-1"
                  disabled={actionLoading}
                >
                  <XIcon className="mr-2 h-4 w-4" />
                  {actionLoading ? 'Updating...' : 'Cancel Request'}
                </Button>
              </div>
            )}

            {request.status === 'completed' && (
              <div className="rounded-md bg-positive/10 p-4 text-positive">
                <div className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 flex-shrink-0" />
                  <span className="text-body font-medium">This request has been fulfilled!</span>
                </div>
              </div>
            )}

            {request.status === 'cancelled' && (
              <div className="rounded-md bg-rose/10 p-4 text-negative">
                <div className="flex items-center">
                  <XIcon className="mr-2 h-5 w-5 flex-shrink-0" />
                  <span className="text-body font-medium">This request has been cancelled.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 