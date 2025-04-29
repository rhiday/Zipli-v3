'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { UsersIcon, CalendarIcon, ClockIcon, CheckIcon, XIcon } from 'lucide-react';

type RequestDetail = {
  id: string;
  description: string;
  people_count: number;
  pickup_date: string;
  pickup_time: string;
  status: string;
  created_at: string;
  user_id: string;
  user: {
    email: string;
  } | null;
};

export default function RequestDetailPage({ params }: { params: { id: string } }): React.ReactElement {
  const router = useRouter();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequest();
    checkUser();
  }, [params.id]);

  const checkUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user) {
      setUser(user);
    }
  };

  const fetchRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          user:users(email)
        `)
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setRequest(data as RequestDetail);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'completed' | 'cancelled') => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: newStatus })
        .eq('id', params.id);

      if (error) throw error;

      // Refresh request data
      await fetchRequest();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-green-700"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <XIcon className="mb-4 h-12 w-12 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-800">Request Not Found</h1>
        <p className="mt-2 text-gray-600">This request may have been removed or doesn't exist.</p>
        <Button
          onClick={() => router.push('/request')}
          className="mt-6 bg-green-700 hover:bg-green-600"
        >
          View All Requests
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === request.user_id;
  const canTakeAction = request.status === 'active';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-6"
        >
          ← Back
        </Button>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                request.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : request.status === 'completed'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {request.status}
              </span>
              <span className="text-sm text-gray-500">
                Created {new Date(request.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="mb-6 space-y-4">
              <p className="text-gray-600">{request.description}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <UsersIcon className="h-5 w-5" />
                  <span>For {request.people_count} people</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <CalendarIcon className="h-5 w-5" />
                  <span>{new Date(request.pickup_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <ClockIcon className="h-5 w-5" />
                  <span>{request.pickup_time}</span>
                </div>
              </div>
            </div>

            {request.user && (
              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <h2 className="mb-2 font-semibold text-gray-800">Requester Information</h2>
                <p className="text-gray-600">{request.user.email}</p>
              </div>
            )}

            {isOwner && canTakeAction && (
              <div className="flex space-x-4">
                <Button
                  onClick={() => handleStatusUpdate('completed')}
                  className="flex-1 bg-green-700 hover:bg-green-600"
                  disabled={actionLoading}
                >
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Mark as Fulfilled
                </Button>
                <Button
                  onClick={() => handleStatusUpdate('cancelled')}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  disabled={actionLoading}
                >
                  <XIcon className="mr-2 h-4 w-4" />
                  Cancel Request
                </Button>
              </div>
            )}

            {request.status === 'completed' && (
              <div className="rounded-lg bg-green-50 p-4 text-green-700">
                <div className="flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5" />
                  <span>This request has been fulfilled!</span>
                </div>
              </div>
            )}

            {request.status === 'cancelled' && (
              <div className="rounded-lg bg-red-50 p-4 text-red-700">
                <div className="flex items-center">
                  <XIcon className="mr-2 h-5 w-5" />
                  <span>This request has been cancelled.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 