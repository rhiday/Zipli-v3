'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ViewportContainer } from '@/components/layout/ViewportContainer';
import { Scale, Utensils, Euro, Leaf, FileDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import { loadJsPDF } from '@/lib/lazy-imports';
import { useDatabase, DonationWithFoodItem } from '@/store';
import {
  DonationCardSkeleton,
  DashboardSkeleton,
} from '@/components/ui/OptimizedSkeleton';
import { useDonationStore } from '@/store/donation';
import { useCommonTranslation } from '@/hooks/useTranslations';
import { ActionButton } from '@/components/ui/action-button';
import {
  calculateDonorMetrics,
  formatWeight,
  formatCurrency,
} from '@/lib/dashboard-utils';
import donationsMock from '@/lib/data/donations_rows.json';

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

    // Clear any draft donations when user navigates to dashboard
    clearDonation();

    const profile: ProfileRow = {
      id: currentUser.id,
      full_name: currentUser.full_name,
      organization_name: null, // Not available in mock user
    };

    // Always use mock data for now
    const mockDonations = (donationsMock as any[]).filter(
      (d) =>
        d.donor_id === currentUser.id ||
        d.donor_id === '44a324c3-7892-4f75-a065-eb2ae1c9d64c'
    );

    const userDonations: DonationWithFoodItem[] = mockDonations.map((d) => ({
      id: d.id,
      donor_id: d.donor_id,
      food_item_id: d.food_item_id,
      receiver_id: d.receiver_id || null,
      quantity: parseFloat(d.quantity),
      status: d.status as 'available' | 'claimed' | 'picked_up' | 'cancelled',
      created_at: d.created_at,
      updated_at: d.updated_at,
      claimed_at: d.claimed_at || null,
      picked_up_at: d.picked_up_at || null,
      pickup_time: d.pickup_time || null,
      pickup_slots:
        typeof d.pickup_slots === 'string'
          ? JSON.parse(d.pickup_slots)
          : d.pickup_slots || null,
      instructions_for_driver: d.instructions_for_driver || null,
      address: d.address || null,
      postal_code: d.postal_code || null,
      latitude: d.latitude || null,
      longitude: d.longitude || null,
      start_date: d.start_date || null,
      end_date: d.end_date || null,
      timezone: d.timezone || 'UTC',
      unit: d.unit || 'kg',
      food_item: {
        id: d.food_item_id,
        name: 'Food',
        description: null,
        image_url: null,
        image_urls: null,
        allergens: null,
        category: null,
        donor_id: d.donor_id,
        expires_at: null,
        food_type: null,
        quantity: parseFloat(d.quantity),
        unit: d.unit || 'kg',
        user_id: d.donor_id,
        created_at: d.created_at,
        updated_at: d.updated_at,
      },
      donor: {
        id: d.donor_id,
        full_name: currentUser.full_name || null,
        organization_name: currentUser.organization_name || '',
        email: currentUser.email || '',
        role: (currentUser.role || 'food_donor') as
          | 'food_donor'
          | 'food_receiver'
          | 'city'
          | 'terminals',
        address: null,
        city: null,
        contact_number: null,
        country: null,
        driver_instructions: null,
        postal_code: null,
        street_address: null,
        created_at: d.created_at,
        updated_at: d.updated_at,
      },
    }));

    setDashboardData({ profile, donations: userDonations });
    setLoading(false);
  }, [isInitialized, currentUser, router]);

  // Calculate dynamic metrics from user donations
  const metrics = React.useMemo(() => {
    return calculateDonorMetrics(dashboardData.donations);
  }, [dashboardData.donations]);

  // Memoized PDF generation function
  const handleExportPDF = useCallback(async () => {
    const jsPDF = await loadJsPDF();
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(t('donationSummaryTitle'), 10, 10);
    doc.setFontSize(12);
    doc.text(
      `Total food offered: ${formatWeight(metrics.totalWeight)}`,
      10,
      20
    );
    doc.text(`Portions offered: ${metrics.portionsOffered}`, 10, 30);
    doc.text(
      `Saved in food disposal costs: ${formatCurrency(metrics.savedCosts)}`,
      10,
      40
    );
    doc.text(`CO2 avoided: ${metrics.co2Avoided}kg`, 10, 50);
    doc.text(`Success rate: ${metrics.successRate}%`, 10, 60);
    doc.save(t('donationSummaryFilename'));
  }, [metrics]);

  if (loading) {
    return (
      <ViewportContainer variant="page" className="pb-nav">
        <Header title={t('loading')} />

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
      </ViewportContainer>
    );
  }

  return (
    <ViewportContainer variant="page" className="pb-nav">
      <Header />

      <main className="relative z-20 -mt-4 rounded-t-3xl bg-base p-4 space-y-6">
        {/* This section is being removed as it's redundant with the header */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-primary">
              {t('yourImpact')}
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
                  {formatWeight(metrics.totalWeight)}
                </span>
                <p className="text-sm text-primary-75 mt-1">
                  {t('totalFoodOffered')}
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
                  {metrics.portionsOffered}
                </span>
                <p className="text-sm text-primary-75 mt-1">
                  {t('portionsOffered')}
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
                  {formatCurrency(metrics.savedCosts)}
                </span>
                <p className="text-sm text-primary-75 mt-1">
                  {t('savedInFoodDisposalCosts')}
                </p>
              </div>
            </div>

            {/* CO2 Avoided */}
            <div className="flex flex-col rounded-xl border border-primary-10 shadow-sm p-4 w-full min-h-24 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4 text-primary-50" />
              </div>
              <div>
                <span className="text-2xl font-semibold text-green-800">
                  {Math.max(1, Math.round(metrics.co2Avoided / 100))}
                </span>
                <p className="text-sm text-primary-75 mt-1">
                  {t('co2Avoided')}
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
              title={t('exportImpactReport')}
              description={t('environmentalAndSocialImpactData')}
              icon={<FileDown />}
            />
          </div>
        </div>

        {/* This is whom you've helped section - Hidden for now */}
        {/* <section>
          <h2 className="text-lg font-semibold text-primary mb-3">
title="Default"
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

      {/* Force-hide any rogue Figma card section if it still exists */}
      <style>{`.rogue-donation-card { display: none !important; }`}</style>
    </ViewportContainer>
  );
}

export default React.memo(DonorDashboardPage);
