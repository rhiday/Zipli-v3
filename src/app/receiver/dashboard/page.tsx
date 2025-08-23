'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';
import {
  ArrowRight,
  Info,
  PlusIcon,
  PackageIcon,
  Scale,
  Utensils,
  Users,
  Calendar,
  FileDown,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import Image from 'next/image';
import { jsPDF } from 'jspdf';
import { useDatabase } from '@/store';
import {
  SkeletonDashboardStat,
  SkeletonRecipient,
} from '@/components/ui/Skeleton';
import { useLanguage } from '@/hooks/useLanguage';
import { ActionButton } from '@/components/ui/action-button';

type ProfileRow = {
  id: string;
  full_name: string | null;
  organization_name: string | null;
};

type ReceiverDashboardData = {
  profile: ProfileRow | null;
  requests: any[];
};

export default function ReceiverDashboardPage(): React.ReactElement {
  const router = useRouter();
  const { currentUser, isInitialized, getAllRequests } = useDatabase();
  const { t } = useLanguage();

  const [dashboardData, setDashboardData] = useState<ReceiverDashboardData>({
    profile: null,
    requests: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;

    setLoading(true);

    if (!currentUser) {
      // Add a small delay before redirecting to avoid race conditions
      const timer = setTimeout(() => {
        if (!currentUser) {
          router.push('/auth/login');
        }
      }, 500);
      return () => clearTimeout(timer);
    }

    const profile: ProfileRow = {
      id: currentUser.id,
      full_name: currentUser.full_name,
      organization_name: null,
    };

    const allRequests = getAllRequests();
    const userRequests = allRequests.filter(
      (r) => r.user_id === currentUser.id
    );

    setDashboardData({ profile, requests: userRequests });
    setLoading(false);
  }, [isInitialized, currentUser, router, getAllRequests]);

  // Memoized PDF generation function
  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Zipli Request Summary', 10, 10);
    doc.setFontSize(12);
    doc.text(`Total food requested: 85kg`, 10, 20);
    doc.text(`People served: 250`, 10, 30);
    doc.text(
      `Active requests: ${dashboardData.requests.filter((r) => r.status === 'active').length}`,
      10,
      40
    );
    doc.text(
      `Fulfilled requests: ${dashboardData.requests.filter((r) => r.status === 'fulfilled').length}`,
      10,
      50
    );
    doc.save('zipli-receiver-summary.pdf');
  }, [dashboardData.requests]);

  // Calculate stats from requests
  const stats = React.useMemo(() => {
    const totalPeople = dashboardData.requests.reduce(
      (sum, req) => sum + req.people_count,
      0
    );
    const activeRequests = dashboardData.requests.filter(
      (r) => r.status === 'active'
    ).length;
    const fulfilledRequests = dashboardData.requests.filter(
      (r) => r.status === 'fulfilled'
    ).length;
    const estimatedKg = Math.round(totalPeople * 0.5); // Rough estimate: 0.5kg per person

    return { totalPeople, activeRequests, fulfilledRequests, estimatedKg };
  }, [dashboardData.requests]);

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <Header title="Loading..." />

        <main className="relative z-20 -mt-4 rounded-t-3xl bg-base p-4 space-y-6">
          <section>
            <div className="flex justify-between items-center mb-4">
              <div className="h-7 w-32 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-6 w-20 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-gray-200 rounded-md animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                  <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              ))}
            </div>
          </section>

          <div className="my-4">
            <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse mb-1"></div>
            <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse"></div>
          </div>

          <section>
            <div className="h-7 w-48 bg-gray-200 rounded-md animate-pulse mb-3"></div>

            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <SkeletonRecipient key={i} />
              ))}
            </div>
          </section>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="relative z-20 -mt-4 rounded-t-3xl bg-base p-4 space-y-6">
        {/* Impact section */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-primary">
              Your Impact
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* People Served - with green background */}
            <div className="flex flex-col justify-between rounded-xl border border-primary-10 shadow-sm p-4 w-full min-h-24 bg-[#F5F9EF]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-50" />
              </div>
              <div>
                <span className="text-2xl font-semibold text-green-800">
                  {stats.totalPeople}
                </span>
                <p className="text-sm text-primary-75 mt-1">People Served</p>
              </div>
            </div>
            {/* Food Requested */}
            <div className="flex flex-col justify-between rounded-xl border border-primary-10 shadow-sm p-4 w-full min-h-24 bg-white">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary-50" />
              </div>
              <div>
                <span className="text-2xl font-semibold text-green-800">
                  {stats.estimatedKg}kg
                </span>
                <p className="text-sm text-primary-75 mt-1">Food Requested</p>
              </div>
            </div>
            {/* Active Requests */}
            <div className="flex flex-col justify-between rounded-xl border border-primary-10 shadow-sm p-4 w-full min-h-24 bg-white">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-50" />
              </div>
              <div>
                <span className="text-2xl font-semibold text-green-800">
                  {stats.activeRequests}
                </span>
                <p className="text-sm text-primary-75 mt-1">
                  Active Requests
                </p>
              </div>
            </div>
            {/* Fulfilled Requests */}
            <div className="flex flex-col justify-between rounded-xl border border-primary-10 shadow-sm p-4 w-full min-h-24 bg-white">
              <div className="flex items-center gap-2">
                <PackageIcon className="w-4 h-4 text-primary-50" />
              </div>
              <div>
                <span className="text-2xl font-semibold text-green-800">
                  {stats.fulfilledRequests}
                </span>
                <p className="text-sm text-primary-75 mt-1">
                  Fulfilled Requests
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Export to PDF as ActionButton */}
        <div className="my-4">
          <div
            onClick={handleExportPDF}
            className="cursor-pointer"
            tabIndex={0}
            role="button"
          >
            <ActionButton
              href="#"
              title="Export Impact Report"
              description="Request history and impact data"
              icon={<FileDown />}
            />
          </div>
        </div>

        {/* Who's helped you section - Hidden for now */}
        {/* <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Who's Helped You
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden relative">
                <Image
                  src="/images/redcross.jpg"
                  alt="Red Cross logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-primary font-medium">Red Cross</h3>
                <p className="text-sm text-primary-75">15 kg · Warm meals</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden relative">
                <Image
                  src="/images/kirkko.jpg"
                  alt="Church logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-primary font-medium">Andreas Church</h3>
                <p className="text-sm text-primary-75">
                  8 kg · Fresh vegetables
                </p>
              </div>
            </div>
          </div>
        </section> */}
      </main>

      <BottomNav />
    </div>
  );
}
