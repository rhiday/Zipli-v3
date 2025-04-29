'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { PlusIcon, ListIcon, UserIcon, LogOutIcon } from 'lucide-react';

type DashboardStats = {
  totalDonations: number;
  activeDonations: number;
  totalRequests: number;
  activeRequests: number;
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 0,
    activeDonations: 0,
    totalRequests: 0,
    activeRequests: 0
  });
  const router = useRouter();

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data?.user) {
      console.error('Not authenticated', error);
      router.push('/auth/login');
      return;
    }
    
    setUser(data.user);

    // Try to get organization data
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!orgError && orgData) {
      setOrganization(orgData);
    }

    // Get statistics
    const [donationsData, requestsData] = await Promise.all([
      supabase.from('donations').select('id, status'),
      supabase.from('requests').select('id, status')
    ]);

    if (!donationsData.error && !requestsData.error) {
      setStats({
        totalDonations: donationsData.data.length,
        activeDonations: donationsData.data.filter(d => d.status === 'active').length,
        totalRequests: requestsData.data.length,
        activeRequests: requestsData.data.filter(r => r.status === 'active').length
      });
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-green-700"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button variant="outline" className="flex items-center">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome{organization ? `, ${organization.name}` : ''}!
          </h2>
          <p className="mt-2 text-gray-600">
            {organization
              ? "You're logged in as an organization. You can create donations and manage your listings."
              : "You're logged in as a user. You can browse donations and make requests."}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Link href="/donate/new">
            <Button
              className="flex h-24 w-full items-center justify-center bg-green-700 hover:bg-green-600"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              Create New Donation
            </Button>
          </Link>
          <Link href="/request/new">
            <Button
              className="flex h-24 w-full items-center justify-center bg-blue-600 hover:bg-blue-500"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              Create New Request
            </Button>
          </Link>
        </div>

        {/* Statistics Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Donations</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalDonations}</p>
            <Link href="/donate" className="mt-4 inline-flex items-center text-sm text-green-600 hover:text-green-500">
              <ListIcon className="mr-1 h-4 w-4" />
              View all
            </Link>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Donations</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.activeDonations}</p>
            <Link href="/donate?status=active" className="mt-4 inline-flex items-center text-sm text-green-600 hover:text-green-500">
              <ListIcon className="mr-1 h-4 w-4" />
              View active
            </Link>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalRequests}</p>
            <Link href="/request" className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
              <ListIcon className="mr-1 h-4 w-4" />
              View all
            </Link>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Requests</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.activeRequests}</p>
            <Link href="/request?status=active" className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
              <ListIcon className="mr-1 h-4 w-4" />
              View active
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Quick Links</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/donate">
              <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                <h3 className="font-medium text-gray-800">Browse Donations</h3>
                <p className="mt-1 text-sm text-gray-600">View available food donations in your area</p>
              </div>
            </Link>
            <Link href="/request">
              <div className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                <h3 className="font-medium text-gray-800">Browse Requests</h3>
                <p className="mt-1 text-sm text-gray-600">View food requests from people in need</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}