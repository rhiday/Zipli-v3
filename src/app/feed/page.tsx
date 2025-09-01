'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDatabase, DonationWithFoodItem } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import DonationCard from '@/components/donations/DonationCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useCommonTranslation } from '@/hooks/useTranslations';

// Simplified type for the feed
type FeedItem = DonationWithFoodItem & {
  donorName: string;
  pickupTime?: string;
};

export default function FeedPage(): React.ReactElement {
  const router = useRouter();
  const { currentUser, donations, foodItems, users, isInitialized } =
    useDatabase();
  const { t } = useCommonTranslation();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isInitialized) return;

    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    // Enrich donations with food item details and donor name
    const enrichedDonations = donations
      .map((donation): FeedItem | null => {
        const foodItem = foodItems.find(
          (fi) => fi.id === donation.food_item_id
        );
        const donor = users.find((u) => u.id === donation.donor_id);
        if (foodItem && donor) {
          return {
            ...donation,
            food_item: foodItem,
            donorName: donor.full_name || 'Anonymous',
            pickupTime: (donation as any).pickup_time,
          };
        }
        return null;
      })
      .filter((d): d is FeedItem => d !== null);

    // For now, the feed will just show all available donations.
    // We filter out donations made by the current user.
    const availableDonations = enrichedDonations.filter(
      (d) => d.status === 'available'
    );

    setFeedItems(availableDonations);
    setLoading(false);
  }, [isInitialized, currentUser, donations, foodItems, users, router]);

  // Memoized search handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  const filteredItems = feedItems.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      item.food_item.name.toLowerCase().includes(searchTermLower) ||
      (item.food_item.description &&
        item.food_item.description.toLowerCase().includes(searchTermLower))
    );
  });

  if (loading) {
    return (
      <div className="min-h-dvh bg-white px-[17px] py-4 md:py-6 lg:py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="relative flex-1 sm:max-w-xs">
              <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }, (_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white px-[17px] py-4 md:py-6 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-titleLg font-display text-primary">
            {t('explore')}
          </h1>
          <div className="relative flex-1 sm:max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-50" />
            <Input
              type="text"
              placeholder={t('searchDonations')}
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 w-full"
            />
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <DonationCard
                key={item.id}
                donation={item}
                donorName={item.donorName}
                pickupTime={item.pickupTime}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-primary">
              {t('noDonationsFound')}
            </h3>
            <p className="mt-2 text-primary-75">{t('noDonationsAvailable')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
