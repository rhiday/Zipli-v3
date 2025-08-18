'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import {
  ArrowLeft,
  Download,
  ChevronDown,
  Scale,
  Utensils,
  Euro,
  Leaf,
  Users,
  Package,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { jsPDF } from 'jspdf';
import { useDatabase } from '@/store';
import { useLanguage } from '@/hooks/useLanguage';

export default function ImpactPage(): React.ReactElement {
  const router = useRouter();
  const { currentUser, isInitialized } = useDatabase();
  const allDonations = useDatabase((state) => state.donations);
  const allRequests = useDatabase((state) => state.requests);
  const foodItems = useDatabase((state) => state.foodItems);
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const periods = [
    { value: 'all', label: 'All Time' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 3 Months' },
    { value: '365days', label: 'Last Year' },
  ];

  useEffect(() => {
    if (!isInitialized) return;

    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    setLoading(false);
  }, [isInitialized, currentUser, router]);

  // Filter data based on selected period and user
  const filteredData = useMemo(() => {
    if (!currentUser) return { userDonations: [], userRequests: [] };

    const now = new Date();
    let cutoffDate: Date;

    switch (selectedPeriod) {
      case '30days':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '365days':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(0); // All time
    }

    const userDonations = allDonations
      .filter((d) => d.donor_id === currentUser.id)
      .filter((d) => new Date(d.created_at) >= cutoffDate)
      .map((d) => {
        const foodItem = foodItems.find((fi) => fi.id === d.food_item_id);
        return { ...d, food_item: foodItem! };
      });

    const userRequests = allRequests
      .filter((r) => r.user_id === currentUser.id)
      .filter((r) => new Date(r.created_at) >= cutoffDate);

    return { userDonations, userRequests };
  }, [currentUser, allDonations, allRequests, foodItems, selectedPeriod]);

  // Calculate impact statistics using the same pattern as dashboard
  const impactStats = useMemo(() => {
    const { userDonations, userRequests } = filteredData;

    // Use the same calculation pattern as the dashboard
    const totalWeight = 46; // Static for now like dashboard
    const totalPortions = 131;
    const costSavings = 125;
    const co2Reduction = 10;
    const peopleHelped = Math.floor(totalPortions / 3);

    return {
      totalWeight,
      totalPortions,
      costSavings,
      co2Reduction,
      peopleHelped,
      donationCount: userDonations.length,
      requestCount: userRequests.length,
      activeDonations: userDonations.filter((d) => d.status === 'available')
        .length,
      completedDonations: userDonations.filter((d) => d.status === 'picked_up')
        .length,
    };
  }, [filteredData]);

  // Handle PDF export
  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Zipli Impact Report', 10, 10);
    doc.setFontSize(12);
    doc.text(`Total food donated: ${impactStats.totalWeight}kg`, 10, 20);
    doc.text(`Portions created: ${impactStats.totalPortions}`, 10, 30);
    doc.text(`Cost savings: €${impactStats.costSavings}`, 10, 40);
    doc.text(`CO2 reduced: ${impactStats.co2Reduction}t`, 10, 50);
    doc.text(`People helped: ${impactStats.peopleHelped}`, 10, 60);
    doc.save('zipli-impact-report.pdf');
  }, [impactStats]);

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <Header title="Loading..." />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="relative z-20 -mt-4 rounded-t-3xl bg-base p-4 space-y-6">
        {/* Header with same pattern as dashboard */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary mb-4">
              Your Complete Impact
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="underline underline-offset-4 inline-flex items-center gap-1 text-primary text-lg font-semibold focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm px-1"
                >
                  {periods.find((p) => p.value === selectedPeriod)?.label}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                {periods.map((period) => (
                  <DropdownMenuItem
                    key={period.value}
                    onSelect={() => setSelectedPeriod(period.value)}
                  >
                    {period.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Same grid pattern as dashboard */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* Total food offered */}
            <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-5 h-5 text-primary-50" />
                <span className="text-2xl font-semibold text-green-800">
                  {impactStats.totalWeight}kg
                </span>
              </div>
              <span className="text-sm text-primary-75">
                Total Food Donated
              </span>
            </div>

            {/* Portions offered */}
            <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-5 h-5 text-primary-50" />
                <span className="text-2xl font-semibold text-green-800">
                  {impactStats.totalPortions}
                </span>
              </div>
              <span className="text-sm text-primary-75">Portions Created</span>
            </div>

            {/* Saved in food disposal costs */}
            <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="w-5 h-5 text-primary-50" />
                <span className="text-2xl font-semibold text-green-800">
                  {impactStats.costSavings}€
                </span>
              </div>
              <span className="text-sm text-primary-75">Cost Savings</span>
            </div>

            {/* CO2 Avoided */}
            <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-primary-50" />
                <span className="text-2xl font-semibold text-green-800">
                  {impactStats.co2Reduction}t
                </span>
              </div>
              <span className="text-sm text-primary-75">CO2 Avoided</span>
            </div>
          </div>
        </section>

        {/* Additional Impact Metrics */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">
            Detailed Analytics
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-primary-10 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-xl font-semibold text-blue-800">
                  {impactStats.peopleHelped}
                </span>
              </div>
              <span className="text-sm text-gray-600">People Helped</span>
            </div>

            <div className="bg-white rounded-xl border border-primary-10 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-purple-600" />
                <span className="text-xl font-semibold text-purple-800">
                  {impactStats.donationCount}
                </span>
              </div>
              <span className="text-sm text-gray-600">Total Donations</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-primary-10 shadow-sm p-4">
            <h4 className="font-semibold text-primary mb-3">
              Activity Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Active Donations</p>
                <p className="text-lg font-semibold text-green-700">
                  {impactStats.activeDonations}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Completed Donations</p>
                <p className="text-lg font-semibold text-blue-700">
                  {impactStats.completedDonations}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Requests</p>
                <p className="text-lg font-semibold text-purple-700">
                  {impactStats.requestCount}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Avg per Donation</p>
                <p className="text-lg font-semibold text-orange-700">
                  {impactStats.donationCount > 0
                    ? `${Math.round((impactStats.totalWeight / impactStats.donationCount) * 10) / 10}kg`
                    : '0kg'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Organizations section - same as dashboard */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            This is whom you've helped
          </h2>

          <div className="space-y-4">
            {/* Recipient 1 - Tsänssi */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden relative">
                <Image
                  src="/images/tsänssi.jpg"
                  alt="Tsänssi logo"
                  fill
                  className="object-contain bg-white"
                  sizes="64px"
                />
              </div>
              <div>
                <h3 className="text-primary font-medium">Tsänssi</h3>
                <p className="text-sm text-primary-75">3 kg · Warm food</p>
              </div>
            </div>

            {/* Recipient 2 - Red cross */}
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
                <h3 className="text-primary font-medium">Red cross</h3>
                <p className="text-sm text-primary-75">
                  10 kg · Warm food; Cold food
                </p>
              </div>
            </div>

            {/* Recipient 3 - Andreas church */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden relative">
                <Image
                  src="/images/kirkko.jpg"
                  alt="Andreas church logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-primary font-medium">Andreas church</h3>
                <p className="text-sm text-primary-75">7 kg · Cold food</p>
              </div>
            </div>
          </div>
        </section>

        {/* Export to PDF - same pattern as dashboard */}
        <div className="my-4">
          <a
            onClick={handleExportPDF}
            className="text-primary underline font-semibold cursor-pointer"
            tabIndex={0}
            role="button"
          >
            Export to PDF
          </a>
          <span className="block text-sm text-primary-75 mt-1">
            Download your complete impact report and analytics
          </span>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
