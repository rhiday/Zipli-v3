'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { PlusIcon, SearchIcon, UsersIcon, CalendarIcon, HandshakeIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';

type Request = {
  id: string;
  description: string;
  people_count: number;
  pickup_date: string;
  pickup_time: string;
  status: string;
  created_at: string;
  user: {
    email: string;
  } | null;
};

export default function RequestsPage(): React.ReactElement {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      let query = supabase
        .from('requests')
        .select(`
          *,
          user:profiles(email)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data as Request[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request =>
    request.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Food Requests</h1>
          <Link href="/request/new">
            <Button className="bg-green-700 hover:bg-green-600">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </Link>
        </div>

        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
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
            onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'completed' | 'cancelled')}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <Link
              key={request.id}
              href={`/request/${request.id}`}
              className="block overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:scale-[1.02]"
            >
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    request.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'completed'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="mb-2 text-md font-semibold text-gray-800 flex items-center">
                  <HandshakeIcon className="mr-2 h-4 w-4 text-blue-600 flex-shrink-0" />
                  {request.description.substring(0, 50)}{request.description.length > 50 ? '...' : ''}
                </h3>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <UsersIcon className="mr-2 h-4 w-4" />
                    <span>For {request.people_count} people</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{new Date(request.pickup_date).toLocaleDateString()}</span>
                  </div>
                  <p>🕒 {request.pickup_time}</p>
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
    </div>
  );
}