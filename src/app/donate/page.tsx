'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/BottomNav';
import { ArrowRight, Info, ChevronDown, PlusIcon, PackageIcon, Scale, Utensils, Euro, Leaf } from 'lucide-react';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { jsPDF } from 'jspdf';
import SummaryOverview from '@/components/SummaryOverview';
import DonationCard from '@/components/donations/DonationCard';
import { useDatabase, DonationWithFoodItem } from '@/store/databaseStore';
import { SkeletonDashboardStat, SkeletonRecipient } from '@/components/ui/Skeleton';
import { useDonationStore } from '@/store/donation';

type ProfileRow = {
    id: string;
    full_name: string | null;
    organization_name: string | null;
};

type DonorDashboardData = {
    profile: ProfileRow | null;
    donations: DonationWithFoodItem[];
}

export default function DonorDashboardPage(): React.ReactElement {
  const router = useRouter();
  const { currentUser, isInitialized } = useDatabase();
  const allDonations = useDatabase(state => state.donations);
  const foodItems = useDatabase(state => state.foodItems);
  const clearDonation = useDonationStore(state => state.clearDonation);

  const [dashboardData, setDashboardData] = useState<DonorDashboardData>({ profile: null, donations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const allMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const lastThreeMonths = Array.from({ length: 3 }, (_, i) => {
      const monthIndex = (currentMonthIndex - 2 + i + 12) % 12;
      return allMonths[monthIndex];
  });

  const [selectedMonth, setSelectedMonth] = useState(allMonths[currentMonthIndex]);

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

    // Clear any draft donations when user navigates to dashboard
    clearDonation();

    const profile: ProfileRow = {
      id: currentUser.id,
      full_name: currentUser.full_name,
      organization_name: null, // Not available in mock user
    };
    
    const userDonations = allDonations
      .filter(d => d.donor_id === currentUser.id)
      .map(d => {
        const foodItem = foodItems.find(fi => fi.id === d.food_item_id);
        return { ...d, food_item: foodItem! };
      });
    
    setDashboardData({ profile, donations: userDonations });
    setLoading(false);

  }, [isInitialized, currentUser, router, allDonations, foodItems]);

  // Memoized PDF generation function
  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Zipli Summary', 10, 10);
    doc.setFontSize(12);
    doc.text(`Total food offered: 46kg`, 10, 20);
    doc.text(`Portions offered: 131`, 10, 30);
    doc.text(`Saved in food disposal costs: 125€`, 10, 40);
    doc.text(`Emission reduction: 89%`, 10, 50);
    doc.save('zipli-summary.pdf');
  }, []);

  // Memoized month selection handler
  const handleMonthSelect = useCallback((month: string) => {
    setSelectedMonth(month);
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
                <div key={i} className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
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
      <Header title={dashboardData.profile?.organization_name || dashboardData.profile?.full_name || 'Donor'} />

      <main className="relative z-20 -mt-4 rounded-t-3xl bg-base p-4 space-y-6">
        {/* This section is being removed as it's redundant with the header */}
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-primary mb-4">Your impact</h2>
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="underline underline-offset-4 inline-flex items-center gap-1 text-primary text-lg font-semibold focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm px-1">
                        {selectedMonth}
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    {lastThreeMonths.map((month) => (
                      <DropdownMenuItem key={month} onSelect={() => handleMonthSelect(month)}>
                        {month}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Total food offered */}
              <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-5 h-5 text-primary-50" />
                  <span className="text-2xl font-semibold text-green-800">46kg</span>
                </div>
                <span className="text-sm text-primary-75">Total food offered</span>
              </div>
              {/* Portions offered */}
              <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-5 h-5 text-primary-50" />
                  <span className="text-2xl font-semibold text-green-800">131</span>
                </div>
                <span className="text-sm text-primary-75">Portions offered</span>
              </div>
              {/* Saved in food disposal costs */}
              <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
                <div className="flex items-center gap-2 mb-2">
                  <Euro className="w-5 h-5 text-primary-50" />
                  <span className="text-2xl font-semibold text-green-800">125€</span>
                </div>
                <span className="text-sm text-primary-75">Saved in food disposal costs</span>
              </div>
              {/* CO2 Avoided */}
              <div className="flex flex-col items-start justify-between rounded-xl border border-primary-10 shadow-sm p-4 sm:p-5 w-full aspect-square">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-primary-50" />
                  <span className="text-2xl font-semibold text-green-800">10t</span>
                </div>
                <span className="text-sm text-primary-75">CO2 Avoided</span>
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
            Export to PDF
          </a>
          <span className="block text-sm text-primary-75 mt-1">
            Environmental and social impact data for reporting, and operation planning.
          </span>
        </div>
        
        {/* This is whom you've helped section */}
        <section>
          <h2 className="text-lg font-semibold text-primary mb-3">This is whom you've helped</h2>
          
          <div className="space-y-4">
            {/* Recipient 1 - Tsänssi */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden relative">
                <Image 
                  src="/images/tsänssi.jpg" 
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
                <p className="text-sm text-primary-75">10 kg · Warm food; Cold food</p>
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
      </main>

      <BottomNav />

      {/* Force-hide any rogue Figma card section if it still exists */}
      <style>{`.rogue-donation-card { display: none !important; }`}</style>
    </div>
  );
}