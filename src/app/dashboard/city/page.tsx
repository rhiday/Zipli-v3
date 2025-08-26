'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';
import {
  ChevronDown,
  TrendingUp,
  Building2,
  Users,
  Leaf,
  Euro,
  MapPin,
  Calendar,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { jsPDF } from 'jspdf';
import { useDatabase } from '@/store';
import {
  SkeletonDashboardStat,
  SkeletonRecipient,
} from '@/components/ui/Skeleton';
import { useCommonTranslation } from '@/hooks/useTranslations';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Enhanced mock data with more realistic values
const monthlyData = [
  { month: 'January', donations: 145, recipients: 38, waste_diverted: 1850 },
  { month: 'February', donations: 168, recipients: 42, waste_diverted: 2100 },
  { month: 'March', donations: 192, recipients: 48, waste_diverted: 2380 },
  { month: 'April', donations: 178, recipients: 51, waste_diverted: 2680 },
  { month: 'May', donations: 203, recipients: 55, waste_diverted: 2950 },
  { month: 'June', donations: 235, recipients: 58, waste_diverted: 3200 },
  { month: 'July', donations: 251, recipients: 62, waste_diverted: 3450 },
  { month: 'August', donations: 278, recipients: 67, waste_diverted: 3800 },
];

const partnerData = [
  { name: 'Sodexo Helsinki Airport', donations: 45, category: 'Corporate' },
  { name: "Alice's Restaurant", donations: 32, category: 'Restaurant' },
  { name: 'School District #3', donations: 28, category: 'Education' },
  { name: 'Kesko Citymarket', donations: 22, category: 'Retail' },
  { name: 'Red Cross Helsinki', donations: 41, category: 'NGO' },
  { name: 'Tsänssi Charity', donations: 38, category: 'NGO' },
];

type ProfileRow = {
  id: string;
  full_name: string | null;
  organization_name: string | null;
};

type CityDashboardData = {
  profile: ProfileRow | null;
  cityStats: any;
};

export default function CityDashboardPage(): React.ReactElement {
  return <DisabledCityDashboardPage />;
}

function DisabledCityDashboardPage(): React.ReactElement {
  const router = useRouter();
  const { currentUser, isInitialized, getAllDonations, getAllRequests } =
    useDatabase();
  const { t } = useCommonTranslation();

  const [dashboardData, setDashboardData] = useState<CityDashboardData>({
    profile: null,
    cityStats: {},
  });
  const [loading, setLoading] = useState(true);

  const allMonths = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const lastThreeMonths = Array.from({ length: 3 }, (_, i) => {
    const monthIndex = (currentMonthIndex - 2 + i + 12) % 12;
    return allMonths[monthIndex];
  });

  const [selectedMonth, setSelectedMonth] = useState(
    allMonths[currentMonthIndex]
  );

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

    // Calculate city-wide stats
    const allDonations = getAllDonations();
    const allRequests = getAllRequests();

    const cityStats = {
      totalDonations: allDonations.length,
      totalRequests: allRequests.length,
      activeDonors: 24,
      activeReceivers: 18,
    };

    setDashboardData({ profile, cityStats });
    setLoading(false);
  }, [isInitialized, currentUser, router, getAllDonations, getAllRequests]);

  // Memoized PDF generation function
  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Helsinki City Food Waste Analysis', 10, 10);
    doc.setFontSize(12);
    doc.text(`Total food redistributed: 3,800kg this month`, 10, 20);
    doc.text(`Partner organizations: 42 active`, 10, 30);
    doc.text(`Waste diverted: 89% reduction`, 10, 40);
    doc.text(`CO2 savings: 2,150kg avoided`, 10, 50);
    doc.save('helsinki-food-analytics.pdf');
  }, []);

  // Memoized month selection handler
  const handleMonthSelect = useCallback((month: string) => {
    setSelectedMonth(month);
  }, []);

  // Calculate city-wide impact stats
  const cityImpactStats = React.useMemo(() => {
    return {
      totalFoodRedistributed: '3.8t',
      partnerOrganizations: 42,
      wasteReduction: '89%',
      co2Savings: '2.15t',
    };
  }, []);

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
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header title="Helsinki Food Terminal" />

      <main className="relative z-20 -mt-4 rounded-t-3xl bg-base p-4 space-y-6">
        {/* City Impact Stats Section */}
        <section>
          <div className="flex justify-between items-start gap-4 mb-4">
            <h2 className="text-lg font-semibold text-primary flex-1">
              City Impact Overview
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="underline underline-offset-4 inline-flex items-center gap-1 text-primary text-lg font-semibold focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm px-1 whitespace-nowrap"
                >
                  {selectedMonth}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                {lastThreeMonths.map((month) => (
                  <DropdownMenuItem
                    key={month}
                    onSelect={() => handleMonthSelect(month)}
                  >
                    {month}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* Total Food Redistributed */}
            <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary-50" />
                <span className="text-2xl font-semibold text-green-800">
                  {cityImpactStats.totalFoodRedistributed}
                </span>
              </div>
              <span className="text-sm text-primary-75">
                Food Redistributed
              </span>
            </div>
            {/* Partner Organizations */}
            <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-primary-50" />
                <span className="text-2xl font-semibold text-green-800">
                  {cityImpactStats.partnerOrganizations}
                </span>
              </div>
              <span className="text-sm text-primary-75">
                Partner Organizations
              </span>
            </div>
            {/* Waste Reduction */}
            <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-primary-50" />
                <span className="text-2xl font-semibold text-green-800">
                  {cityImpactStats.wasteReduction}
                </span>
              </div>
              <span className="text-sm text-primary-75">Waste Reduction</span>
            </div>
            {/* CO2 Savings */}
            <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="w-5 h-5 text-primary-50" />
                <span className="text-2xl font-semibold text-green-800">
                  {cityImpactStats.co2Savings}
                </span>
              </div>
              <span className="text-sm text-primary-75">CO2 Saved</span>
            </div>
          </div>
        </section>

        {/* Export to PDF as a text link */}
        <div className="my-4">
          <a
            onClick={handleExportPDF}
            className="text-primary underline font-semibold cursor-pointer"
            tabIndex={0}
            role="button"
          >
            Export Analytics Report
          </a>
          <span className="block text-sm text-primary-75 mt-1">
            Comprehensive city food waste analytics and impact data
          </span>
        </div>

        {/* Analytics Charts Section */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Monthly Trends
          </h2>

          <div className="rounded-xl border border-primary-10 shadow-sm p-4 bg-white mb-6">
            <h3 className="text-base font-medium text-primary mb-4">
              Food Redistribution Growth
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="donations"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Donations"
                  />
                  <Line
                    type="monotone"
                    dataKey="recipients"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Recipients"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Top Partners section */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            Top Partner Organizations
          </h2>

          <div className="space-y-4">
            {partnerData.slice(0, 5).map((partner, index) => (
              <div key={partner.name} className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full overflow-hidden relative bg-gray-100 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-primary font-medium">{partner.name}</h3>
                  <p className="text-sm text-primary-75">
                    {partner.donations} donations · {partner.category}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-800">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
