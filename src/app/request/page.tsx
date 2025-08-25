'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useDatabase } from '@/store';
import {
  PlusIcon,
  SearchIcon,
  UsersIcon,
  CalendarIcon,
  HandshakeIcon,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { useCommonTranslation } from '@/hooks/useTranslations';
import { RequestCardSkeleton } from '@/components/ui/OptimizedSkeleton';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/BottomNav';

type Request = {
  id: string;
  description: string;
  people_count: number;
  pickup_date: string;
  pickup_start_time: string;
  pickup_end_time: string;
  status: string;
  created_at: string;
  user_id: string;
};

export default function RequestsPage(): React.ReactElement {
  const { t } = useCommonTranslation();

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'fulfilled' | 'cancelled'
  >('all');

  const { isInitialized, getAllRequests, users } = useDatabase();

  useEffect(() => {
    if (isInitialized) {
      fetchRequests();
    }
  }, [isInitialized, statusFilter]);

  const fetchRequests = async () => {
    try {
      const allRequests = getAllRequests();

      let filteredByStatus = allRequests;
      if (statusFilter !== 'all') {
        filteredByStatus = allRequests.filter(
          (req) => req.status === statusFilter
        );
      }

      setRequests(filteredByStatus);
    } catch (err: any) {
      setError(t('pages.requests.failed_to_load_requests'));
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) =>
    request.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserEmail = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.email || 'Unknown user';
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-20 bg-cream">
        <Header title="Loading Requests..." />
        <main className="relative z-20 -mt-4 rounded-t-3xl bg-white p-4 space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Filter skeleton */}
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex space-x-4">
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Request cards skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <RequestCardSkeleton key={i} />
            ))}
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <main className="relative z-20 -mt-4 rounded-t-3xl bg-base p-4 space-y-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Food Requests</h1>
            <Link href="/request/new">
              <Button className="bg-green-700 hover:bg-green-600">
                <PlusIcon className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </Link>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(
                  value as 'all' | 'active' | 'fulfilled' | 'cancelled'
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('pages.requests.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Link
                key={request.id}
                href={`/request/${request.id}`}
                className="block overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:scale-[1.02]"
              >
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        request.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : request.status === 'fulfilled'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="mb-2 text-md font-semibold text-gray-800 flex items-center">
                    <HandshakeIcon className="mr-2 h-4 w-4 text-blue-600 flex-shrink-0" />
                    {request.description.substring(0, 50)}
                    {request.description.length > 50 ? '...' : ''}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <UsersIcon className="mr-2 h-4 w-4" />
                      <span>For {request.people_count} people</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>
                        {new Date(request.pickup_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p>
                      🕒 {request.pickup_start_time} - {request.pickup_end_time}
                    </p>
                    <p className="text-xs">
                      By: {getUserEmail(request.user_id)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredRequests.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500">
                {searchTerm
                  ? 'No requests found matching your search.'
                  : 'No requests available at the moment.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
