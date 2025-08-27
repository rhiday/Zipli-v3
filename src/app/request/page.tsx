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
import PageContainer from '@/components/layout/PageContainer';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';

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
      <PageContainer
        header={<SecondaryNavbar title="Food Requests" />}
        className="bg-white"
        contentClassName="flex items-center justify-center min-h-[50vh]"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#024209]"></div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      header={
        <div className="flex items-center justify-between px-4 py-4 border-b border-primary-10">
          <h1 className="text-xl font-semibold text-[#021d13]">
            Food Requests
          </h1>
          <Link href="/request/select-type">
            <Button
              size="sm"
              className="bg-[#024209] hover:bg-[#033A07] text-white rounded-[12px] px-4 py-2 text-sm font-semibold"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </Link>
        </div>
      }
      className="bg-white"
      contentClassName="p-4 space-y-6"
    >
      <div className="flex flex-col space-y-4">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-[12px] border-[#D9DBD5] h-12"
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
          <SelectTrigger className="w-full rounded-[12px] border-[#D9DBD5] h-12">
            <SelectValue placeholder="All Statuses" />
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
        <div className="p-3 rounded-[12px] bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {filteredRequests.map((request) => (
          <Link
            key={request.id}
            href={`/request/${request.id}`}
            className="block"
          >
            <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5] min-h-[56px] transition-colors hover:bg-[#EDF7E3]">
              <div className="flex items-start space-x-3 flex-1">
                <HandshakeIcon className="h-5 w-5 text-[#024209] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-[#024209] truncate">
                      {request.description.substring(0, 40)}
                      {request.description.length > 40 ? '...' : ''}
                    </h3>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
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
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <UsersIcon className="mr-1 h-4 w-4" />
                      <span>For {request.people_count}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      <span>
                        {new Date(request.pickup_date).toLocaleDateString(
                          'en-GB',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                    <span>
                      {request.pickup_start_time} - {request.pickup_end_time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    By: {getUserEmail(request.user_id)}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="rounded-[12px] border-2 border-dashed border-[#D9DBD5] p-8 text-center">
          <p className="text-gray-500 font-medium">
            {searchTerm
              ? 'No requests found matching your search.'
              : 'No requests available at the moment.'}
          </p>
        </div>
      )}
    </PageContainer>
  );
}
