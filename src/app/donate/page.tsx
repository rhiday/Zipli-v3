'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Info,
  PlusIcon,
  PackageIcon,
  Scale,
  Utensils,
  Euro,
  Leaf,
  FileDown,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Link from 'next/link';
import Image from 'next/image';
import { loadJsPDF } from '@/lib/lazy-imports';
import SummaryOverview from '@/components/SummaryOverview';
import DonationCard from '@/components/donations/DonationCard';
import { useDatabase, DonationWithFoodItem } from '@/store';
import {
  DonationCardSkeleton,
  DashboardSkeleton,
} from '@/components/ui/OptimizedSkeleton';
import { useDonationStore } from '@/store/donation';
import { useCommonTranslation } from '@/hooks/useTranslations';
import { ActionButton } from '@/components/ui/action-button';

type ProfileRow = {
  id: string;
  full_name: string | null;
  organization_name: string | null;
};

type DonorDashboardData = {
  profile: ProfileRow | null;
  donations: DonationWithFoodItem[];
};

function DonorDashboardPage(): React.ReactElement {
  const router = useRouter();
  // Use selectors to prevent unnecessary re-renders
  const currentUser = useDatabase((state) => state.currentUser);
  const isInitialized = useDatabase((state) => state.isInitialized);
  const allDonations = useDatabase((state) => state.donations);
  const foodItems = useDatabase((state) => state.foodItems);
  const clearDonation = useDonationStore((state) => state.clearDonation);
  const { t } = useCommonTranslation();

  const [dashboardData, setDashboardData] = useState<DonorDashboardData>({
    profile: null,
    donations: [],
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

    // Only clear draft donations if user is not in the middle of a donation flow
    // Check if user has active donation items or is in edit mode
    const { donationItems, isEditMode } = useDonationStore.getState();
    const hasActiveDonation = donationItems.length > 0 || isEditMode;

    if (!hasActiveDonation) {
      clearDonation();
    }

    const profile: ProfileRow = {
      id: currentUser.id,
      full_name: currentUser.full_name,
      organization_name: null, // Not available in mock user
    };

    // Fetch latest donations to ensure we have current data
    const fetchLatestDonations = async () => {
      const { fetchDonations } = useDatabase.getState();
      await fetchDonations();

      const userDonations = allDonations
        .filter((d) => d.donor_id === currentUser.id)
        .map((d) => {
          const foodItem = foodItems.find((fi) => fi.id === d.food_item_id);
          return { ...d, food_item: foodItem! };
        });

      setDashboardData({ profile, donations: userDonations });
      setLoading(false);
    };

    fetchLatestDonations();
  }, [isInitialized, currentUser, router, allDonations, foodItems]);

  // Memoized PDF generation function
  const handleExportPDF = useCallback(async () => {
    const jsPDF = await loadJsPDF();
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Zipli Donation Summary', 10, 10);
    doc.setFontSize(12);
    doc.text(`Total food offered: 46kg`, 10, 20);
    doc.text(`Portions offered: 131`, 10, 30);
    doc.text(`Saved in food disposal costs: 125€`, 10, 40);
    doc.text(`Emission reduction: 89%`, 10, 50);
    doc.save('zipli-summary.pdf');
  }, []);

  if (loading) {
    return (
      <div className="min-h-[100svh] pb-20">
        <Header title={'Loading'} />

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
                <DonationCardSkeleton key={i} />
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] pb-20">
      <Header />

      <main className="relative z-20 -mt-4 rounded-t-3xl bg-base p-4 space-y-6">
        {/* This section is being removed as it's redundant with the header */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-primary">
              {t('pages.impact.subtitle')}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* Total food offered - with green background */}
            <div className="flex flex-col justify-between rounded-xl border border-primary-10 shadow-sm p-4 w-full min-h-24 bg-[#F5F9EF]">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary-50" />
              </div>
              <div>
                <span className="text-2xl font-semibold text-green-800">
                  46kg
                </span>
                <p className="text-sm text-primary-75 mt-1">
                  {t('pages.impact.totalWeight')}
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
                  131
                </span>
                <p className="text-sm text-primary-75 mt-1">
                  {t('pages.impact.portionsOffered')}
                </p>
              </div>
            </div>

            {/* Saved in food disposal costs */}
            <div className="flex flex-col justify-between rounded-xl border border-primary-10 shadow-sm p-4 w-full min-h-24 bg-white">
              <div className="flex items-center gap-2">
                <Euro className="w-4 h-4 text-primary-50" />
              </div>
              <div>
                <span className="text-2xl font-semibold text-green-800">
                  125€
                </span>
                <p className="text-sm text-primary-75 mt-1">
                  {t('pages.impact.savedInDisposalCosts')}
                </p>
              </div>
            </div>

            {/* CO2 Avoided */}
            <div className="flex flex-col justify-between rounded-xl border border-primary-10 shadow-sm p-4 w-full min-h-24 bg-white">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary-50" />
              </div>
              <div>
                <span className="text-2xl font-semibold text-green-800">
                  10t
                </span>
                <p className="text-sm text-primary-75 mt-1">
                  {t('pages.impact.co2AvoidedDesc')}
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
              title={t('exportToPdf')}
              description={t('environmentalAndSocialImpactData')}
              icon={<FileDown />}
            />
          </div>
        </div>

        {/* This is whom you've helped section - Hidden for now */}
        {/* <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
            {t('peopleYouHelped')}
          </h2>

          <div className="space-y-4">
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
        </section> */}
      </main>

      {/* BottomNav is provided by AppShell; avoid duplicate mount here */}

      {/* Force-hide any rogue Figma card section if it still exists */}
      <style>{`.rogue-donation-card { display: none !important; }`}</style>
    </div>
  );
}

export default React.memo(DonorDashboardPage);
