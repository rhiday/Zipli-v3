'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store/databaseStore';
import { UsersIcon, CalendarIcon, ClockIcon, CheckIcon, XIcon, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type RequestDetail = {
  id: string;
  description: string;
  people_count: number;
  pickup_date: string;
  pickup_start_time: string;
  pickup_end_time: string;
  status: 'active' | 'fulfilled' | 'cancelled';
  created_at: string;
  updated_at: string;
  user_id: string;
  is_recurring: boolean;
};

export default function RequestDetailPage({ params }: { params: { id: string } }): React.ReactElement {
  const router = useRouter();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { currentUser, getRequestById, updateRequest, users, isInitialized } = useDatabase();

  useEffect(() => {
    if (isInitialized && params.id) {
      fetchRequest();
    }
  }, [isInitialized, params.id]);

  const fetchRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const requestData = getRequestById(params.id);
      if (!requestData) {
        throw new Error('Request not found');
      }
      setRequest(requestData);
    } catch (err: any) {
      setError(err.message || 'Failed to load request details.');
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'fulfilled' | 'cancelled') => {
    if (!currentUser || !request) {
      setError('Cannot update status: User or Request data missing.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      updateRequest(params.id, { status: newStatus });
      await fetchRequest();
    } catch (err: any) {
      setError(err.message || 'Failed to update request status.');
    } finally {
      setActionLoading(false);
    }
  };

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.email || 'Unknown user';
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
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
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

  const isOwner = currentUser?.id === request.user_id;
  const canTakeAction = request.status === 'active';

  const statusClass = (() => {
    switch (request.status) {
      case 'active': return 'bg-positive/10 text-positive';
      case 'fulfilled': return 'bg-stone text-primary-50';
      case 'cancelled': return 'bg-rose/10 text-negative';
      default: return 'bg-stone text-primary-50';
    }
  })();

  return (
    <div className="min-h-screen pb-20">
      <main className="relative z-20 -mt-4 rounded-t-3xl bg-base p-4 space-y-6">
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
          <div className="p-6">
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

              <div className="space-y-3">
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
                <div className="text-body text-primary-75">
                  <span>Requested by: {getUserEmail(request.user_id)}</span>
                </div>
                {request.is_recurring && (
                  <div className="text-body text-primary-75">
                    <span>🔄 Recurring request</span>
                  </div>
                )}
              </div>
            </div>

            {isOwner && canTakeAction && (
              <div className="border-t border-primary-10 pt-6">
                <p className="mb-4 text-body text-primary-75">
                  You can mark this request as completed or cancel it.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleStatusUpdate('fulfilled')}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <CheckIcon className="h-4 w-4" />
                    )}
                    Mark as Fulfilled
                  </Button>
                  <Button
                    variant="destructive"
                    size="md"
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <XIcon className="h-4 w-4" />
                    )}
                    Cancel Request
                  </Button>
                </div>
              </div>
            )}

            {!isOwner && canTakeAction && (
              <div className="border-t border-primary-10 pt-6">
                <p className="mb-4 text-body text-primary-75">
                  Interested in fulfilling this request? Contact the requester directly.
                </p>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    const email = getUserEmail(request.user_id);
                    window.location.href = `mailto:${email}?subject=Re: Food Request - ${request.description.substring(0, 50)}`;
                  }}
                >
                  Contact Requester
                </Button>
              </div>
            )}

            {!canTakeAction && (
              <div className="border-t border-primary-10 pt-6">
                <p className="text-body text-primary-50">
                  This request is no longer active.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 