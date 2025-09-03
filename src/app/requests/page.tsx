'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useDatabase } from '@/store';
import {
  ArrowLeft,
  FilterXIcon,
  HandHeart,
  SlidersHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useCommonTranslation } from '@/lib/i18n-enhanced';
import { cn } from '@/lib/utils';

type RequestItem = {
  id: string;
  created_at: string;
  user_id: string;
  description: string;
  people_count: number;
  pickup_date: string;
  pickup_start_time: string;
  pickup_end_time: string;
  status: 'active' | 'fulfilled' | 'cancelled';
  is_recurring: boolean;
};

const statusOptions = ['all', 'active', 'fulfilled', 'cancelled'];

export default function RequestsListPage(): React.ReactElement {
  const router = useRouter();
  const { t } = useCommonTranslation();
  const { currentUser, getAllRequests, isInitialized } = useDatabase();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isInitialized || !currentUser) return;

    setLoading(true);
    try {
      const allRequests = getAllRequests();
      // Filter to show only current user's requests
      const userRequests = allRequests.filter(
        (request) => request.user_id === currentUser.id
      );
      setRequests(userRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  }, [isInitialized, currentUser, getAllRequests]);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const parseRequestInfo = (description: string) => {
    const parts = description.split(' | ');
    const mainPart = parts[0] || description;
    const requestName = mainPart.replace('Request for ', '');
    return { requestName };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-positive/10 text-positive border-positive';
      case 'fulfilled':
        return 'bg-stone text-primary-50 border-stone';
      case 'cancelled':
        return 'bg-rose/10 text-negative border-rose';
      default:
        return 'bg-stone text-primary-50 border-stone';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-cream pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-base border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent p-0 text-primary hover:bg-cloud"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-primary">
              {t('seeAllRequests')}
            </h1>
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent p-0 text-primary hover:bg-cloud"
          >
            <SlidersHorizontalIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-t border-border bg-base p-4 space-y-4">
            <div>
              <Input
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {statusOptions.map((status) => (
                <Button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  variant={statusFilter === status ? 'primary' : 'secondary'}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {status === 'all' ? t('all') : status}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <HandHeart className="h-16 w-16 text-stone mb-4" />
            <h2 className="text-lg font-semibold text-primary mb-2">
              {t('noRequestsFound')}
            </h2>
            <p className="text-secondary mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : "You haven't created any requests yet"}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button
                onClick={() => router.push('/request/select-type')}
                variant="primary"
              >
                {t('createRequest')}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const requestInfo = parseRequestInfo(request.description);
              return (
                <div
                  key={request.id}
                  className="bg-base rounded-lg p-4 border border-border shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary mb-1">
                        {requestInfo.requestName}
                      </h3>
                      <p className="text-sm text-secondary">
                        {request.people_count} kg requested
                      </p>
                      {request.is_recurring && (
                        <p className="text-xs text-secondary mt-1">
                          🔄 Recurring request
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full border capitalize',
                          getStatusColor(request.status)
                        )}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-secondary mb-3">
                    <div className="mb-1">
                      📅{' '}
                      {new Date(request.pickup_date).toLocaleDateString(
                        'fi-FI'
                      )}
                    </div>
                    <div>
                      ⏰ {request.pickup_start_time} - {request.pickup_end_time}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/request/${request.id}`)}
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                    >
                      {t('view')} {t('details')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
