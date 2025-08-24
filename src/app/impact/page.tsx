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
  TrendingUp as TrendingIcon,
  BarChart,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { loadJsPDF } from '@/lib/lazy-imports';
import { useDatabase } from '@/store';
import { useLanguage } from '@/hooks/useLanguage';
import {
  impactCalculator,
  generateRealisticMockData,
} from '@/lib/impact-calculator';

function ImpactPage(): React.ReactElement {
  const router = useRouter();
  // Use selectors to prevent unnecessary re-renders
  const currentUser = useDatabase((state) => state.currentUser);
  const isInitialized = useDatabase((state) => state.isInitialized);
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
    let periodDays: number;

    switch (selectedPeriod) {
      case '30days':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        periodDays = 30;
        break;
      case '90days':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        periodDays = 90;
        break;
      case '365days':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        periodDays = 365;
        break;
      default:
        cutoffDate = new Date(0); // All time
        periodDays = 0;
    }

    // Transform database format to impact calculator format
    const userDonations = allDonations
      .filter((d) => d.donor_id === currentUser.id)
      .filter((d) => new Date(d.created_at) >= cutoffDate)
      .map((d) => {
        const foodItem = foodItems.find((fi) => fi.id === d.food_item_id);
        return {
          id: d.id,
          food_item: {
            name: foodItem?.name || 'Food donation',
            weight_kg: foodItem?.quantity || 2.5, // Use quantity as weight
            created_at: d.created_at,
            category: foodItem?.food_type || 'mixed',
          },
          status: d.status as
            | 'available'
            | 'requested'
            | 'picked_up'
            | 'expired',
          created_at: d.created_at,
          picked_up_at: d.pickup_time || undefined,
          donor_id: d.donor_id,
        };
      });

    // Use realistic mock data for demo if no real data exists
    const donationsForCalculation =
      userDonations.length > 0 ? userDonations : generateRealisticMockData(12);

    const userRequests = allRequests
      .filter((r) => r.user_id === currentUser.id)
      .filter((r) => new Date(r.created_at) >= cutoffDate);

    return { userDonations: donationsForCalculation, userRequests, periodDays };
  }, [currentUser, allDonations, allRequests, foodItems, selectedPeriod]);

  // Calculate realistic impact metrics and trends
  const { impactStats, trendData, benchmarks } = useMemo(() => {
    const { userDonations, userRequests, periodDays } = filteredData;

    // Calculate comprehensive impact metrics using real data
    const metrics = impactCalculator.calculateImpact(userDonations, periodDays);

    // Generate realistic trend data based on actual donations
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trends = impactCalculator.calculateTrends(userDonations, months);

    // Get benchmark comparisons
    const benchmarks = impactCalculator.getBenchmarks(metrics);

    // Additional stats for compatibility with existing UI
    const additionalStats = {
      requestCount: userRequests.length,
      activeDonations: userDonations.filter((d) => d.status === 'available')
        .length,
      completedDonations: userDonations.filter((d) => d.status === 'picked_up')
        .length,
    };

    return {
      impactStats: { ...metrics, ...additionalStats },
      trendData: {
        donationTrend: trends.map((t) => ({
          month: t.period,
          donations: t.donations,
          weight: t.weight,
        })),
        impactTrend: trends.map((t) => ({
          month: t.period,
          co2: t.co2,
          cost: t.cost,
        })),
      },
      benchmarks,
    };
  }, [filteredData]);

  // Handle PDF export with comprehensive metrics
  const handleExportPDF = useCallback(async () => {
    const jsPDF = await loadJsPDF();
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text('Zipli Impact Report', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(
      `Period: ${periods.find((p) => p.value === selectedPeriod)?.label}`,
      20,
      36
    );

    // Key metrics
    doc.setFontSize(14);
    doc.text('Impact Summary', 20, 50);
    doc.setFontSize(11);
    doc.text(`Total food donated: ${impactStats.totalWeight}kg`, 25, 60);
    doc.text(`Portions created: ${impactStats.totalPortions}`, 25, 67);
    doc.text(`People helped: ${impactStats.peopleHelped}`, 25, 74);
    doc.text(`Meals provided: ${impactStats.mealsProvided}`, 25, 81);

    // Environmental impact
    doc.setFontSize(14);
    doc.text('Environmental Impact', 20, 95);
    doc.setFontSize(11);
    doc.text(
      `CO2 emissions avoided: ${impactStats.co2Avoided}kg (${impactStats.co2AvoidedTons}t)`,
      25,
      105
    );
    doc.text(
      `Environmental score: ${impactStats.environmentalScore}/100`,
      25,
      112
    );
    doc.text(`${benchmarks.co2Equivalent}`, 25, 119);

    // Economic impact
    doc.setFontSize(14);
    doc.text('Economic Impact', 20, 133);
    doc.setFontSize(11);
    doc.text(`Disposal cost savings: €${impactStats.costSavings}`, 25, 143);
    doc.text(`Food value saved: €${impactStats.foodValueSaved}`, 25, 150);
    doc.text(`Total social value: €${impactStats.socialValue}`, 25, 157);

    // Performance metrics
    doc.setFontSize(14);
    doc.text('Performance Metrics', 20, 171);
    doc.setFontSize(11);
    doc.text(`Success rate: ${impactStats.successRate}%`, 25, 181);
    doc.text(
      `Average time to pickup: ${impactStats.averageDaysToPickup} days`,
      25,
      188
    );
    doc.text(
      `Waste reduction rate: ${impactStats.wasteReductionRate}%`,
      25,
      195
    );

    doc.save(`zipli-impact-report-${selectedPeriod}.pdf`);
  }, [impactStats, benchmarks, selectedPeriod, periods]);

  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <div className="bg-base p-4 pt-6">
          <div className="h-7 w-32 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <main className="bg-base p-4 space-y-6 pt-6">
        {/* Header with same pattern as dashboard */}
        <section>
          <div className="flex justify-between items-start gap-4 mb-4">
            <h2 className="text-lg font-semibold text-primary flex-1">
              Your Complete Impact
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="underline underline-offset-4 inline-flex items-center gap-1 text-primary text-lg font-semibold focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm px-1 whitespace-nowrap"
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

          {/* Updated grid pattern with rectangular boxes */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* Total food offered - with green background */}
            <div className="flex flex-col justify-between rounded-xl border border-primary-10 shadow-sm p-4 w-full min-h-24 bg-[#F5F9EF]">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary-50" />
              </div>
              <div>
                <span className="text-2xl font-semibold text-green-800">
                  {impactStats.totalWeight}kg
                </span>
                <p className="text-sm text-primary-75 mt-1">
                  Total Food Donated
                </p>
              </div>
            </div>

            {/* Portions offered */}
            <div className="flex flex-col justify-between rounded-xl border border-primary-10 shadow-sm p-4 w-full min-h-24 bg-white">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-primary-50" />
              </div>
              <div>
                <span className="text-2xl font-semibold text-green-800">
                  {impactStats.totalPortions}
                </span>
                <p className="text-sm text-primary-75 mt-1">Portions Created</p>
              </div>
            </div>

            {/* Saved in food disposal costs */}
            <div className="flex flex-col justify-between rounded-xl border border-primary-10 shadow-sm p-4 w-full min-h-24 bg-white">
              <div className="flex items-center gap-2">
                <Euro className="w-4 h-4 text-primary-50" />
              </div>
              <div>
                <span className="text-2xl font-semibold text-green-800">
                  {impactStats.costSavings}€
                </span>
                <p className="text-sm text-primary-75 mt-1">Cost Savings</p>
              </div>
            </div>

            {/* CO2 Avoided */}
            <div className="flex flex-col justify-between rounded-xl border border-primary-10 shadow-sm p-4 w-full min-h-24 bg-white">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary-50" />
              </div>
              <div>
                <span className="text-2xl font-semibold text-green-800">
                  {impactStats.co2AvoidedTons}t
                </span>
                <p className="text-sm text-primary-75 mt-1">CO2 Avoided</p>
              </div>
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

        {/* Trend Visualizations */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">
            Historical Trends
          </h3>

          {/* Donation Trend Chart */}
          <div className="bg-white rounded-xl border border-primary-10 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingIcon className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-primary">
                Donation Trend (Last 6 Months)
              </h4>
            </div>

            <div className="relative h-40 flex items-end justify-between px-2">
              {trendData.donationTrend.map((data, index) => {
                const maxWeight = Math.max(
                  ...trendData.donationTrend.map((d) => d.weight)
                );
                const height = (data.weight / maxWeight) * 100;
                return (
                  <div
                    key={data.month}
                    className="flex flex-col items-center flex-1"
                  >
                    <div className="relative w-full max-w-[30px] mx-1">
                      <div
                        className="bg-gradient-to-t from-green-500 to-green-300 rounded-t-md transition-all duration-500 ease-out"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                        {data.weight}kg
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 mt-2">
                      {data.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>📈 +40% vs last period</span>
              <span>
                Total:{' '}
                {trendData.donationTrend.reduce((sum, d) => sum + d.weight, 0)}
                kg
              </span>
            </div>
          </div>

          {/* Impact Metrics Trend */}
          <div className="bg-white rounded-xl border border-primary-10 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-primary">
                Environmental Impact Trend
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* CO2 Reduction Mini Chart */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  CO2 Reduction (kg)
                </h5>
                <div className="flex items-end h-16 gap-1">
                  {trendData.impactTrend.map((data, index) => {
                    const maxCo2 = Math.max(
                      ...trendData.impactTrend.map((d) => d.co2)
                    );
                    const height = (data.co2 / maxCo2) * 100;
                    return (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div
                          className="bg-blue-400 rounded-t-sm w-full transition-all duration-300"
                          style={{ height: `${height}%` }}
                        ></div>
                        <span className="text-xs text-gray-500 mt-1">
                          {data.month.slice(0, 1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  ↗ +25% improvement
                </p>
              </div>

              {/* Cost Savings Mini Chart */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Cost Savings (€)
                </h5>
                <div className="flex items-end h-16 gap-1">
                  {trendData.impactTrend.map((data, index) => {
                    const maxCost = Math.max(
                      ...trendData.impactTrend.map((d) => d.cost)
                    );
                    const height = (data.cost / maxCost) * 100;
                    return (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div
                          className="bg-orange-400 rounded-t-sm w-full transition-all duration-300"
                          style={{ height: `${height}%` }}
                        ></div>
                        <span className="text-xs text-gray-500 mt-1">
                          {data.month.slice(0, 1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-green-600 mt-1">↗ +35% savings</p>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-800">
                {impactStats.successRate}%
              </div>
              <div className="text-xs text-green-600">Success Rate</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-800">
                {impactStats.averageWeight}kg
              </div>
              <div className="text-xs text-blue-600">Avg/Donation</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-800">
                {impactStats.averageDaysToPickup}d
              </div>
              <div className="text-xs text-purple-600">Avg Pickup Time</div>
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

export default React.memo(ImpactPage);
