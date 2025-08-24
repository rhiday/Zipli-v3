'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageIcon, MapPinIcon, ShoppingBag } from 'lucide-react';
import { DonationWithFoodItem, useDatabase } from '@/store';
import { CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

interface DonationCardProps {
  donation: DonationWithFoodItem;
  donorName?: string;
  pickupTime?: string;
  className?: string;
}

const DonationCard: React.FC<DonationCardProps> = React.memo(
  ({ donation, donorName, pickupTime, className }) => {
    const { t } = useLanguage();
    // Use selector to only get what we need and prevent re-renders
    const users = useDatabase((state) => state.users);

    // All hooks must be called before any early returns
    const [imgError, setImgError] = useState(false);

    // Memoized error handler
    const handleImageError = useCallback(() => {
      setImgError(true);
    }, []);

    // Memoized calculations - handle null donation case inside the hook
    const displayData = React.useMemo(() => {
      if (!donation || !donation.food_item) {
        return null;
      }

      const { donor_id, quantity, distance } = donation as any;
      // Fallbacks for demo/mock data
      const donorFromStore = users.find((u) => u.id === donor_id);
      const resolvedDonorName =
        donorName ||
        donorFromStore?.full_name ||
        donorFromStore?.organization_name;
      const displayDonor =
        resolvedDonorName || t('pages.donate.detail.generousDonor');
      const displayDistance = distance || '2.4km'; // TODO: replace with real value if available
      const displayTime =
        pickupTime ||
        (donation as any).pickup_time ||
        (donation as any).pickup_end_time ||
        undefined;

      // Only show numeric quantity, always in kg
      let numericQuantity = 0;
      if (typeof quantity === 'number') {
        numericQuantity = quantity;
      } else if (typeof quantity === 'string') {
        const match = quantity.match(/\d+(?:\.\d+)?/);
        numericQuantity = match ? parseFloat(match[0]) : 0;
      }
      const displayUnit = 'kg';

      return {
        displayDonor,
        displayDistance,
        displayTime,
        numericQuantity,
        displayUnit,
      };
    }, [donorName, users, donation, pickupTime, t]);

    // Memoized time formatter
    const formattedPickupTime = React.useMemo(() => {
      if (!displayData?.displayTime) return t('common.time.availableNow');
      try {
        const date = new Date(displayData.displayTime);
        // If time is in the future, show 'Tomorrow until ...' or 'Until ...'
        const now = new Date();
        if (date.getDate() === now.getDate() + 1) {
          return `${t('common.time.tomorrow')} ${t('common.time.until')} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
        }
        return `${t('common.time.until')} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
      } catch (e) {
        return t('common.time.availableNow');
      }
    }, [displayData?.displayTime, t]);

    // Early return after all hooks are called
    if (!donation || !donation.food_item || !displayData) {
      return null;
    }

    const { id, food_item } = donation;

    return (
      <Link href={`/donate/detail/${id}`} className="block group">
        <div
          className={cn(
            'overflow-hidden rounded-2xl bg-white transition-all duration-200 ease-in-out group-hover:-translate-y-1 p-2',
            className
          )}
        >
          <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-3">
            {/* Distance badge */}
            <span className="absolute top-2 left-2 z-10 rounded-full bg-black/70 text-white text-xs px-2 py-0.5 flex items-center gap-1">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 2C7.03 2 3 6.03 3 11c0 5.25 7.11 10.45 8.09 11.18a1 1 0 0 0 1.18 0C13.89 21.45 21 16.25 21 11c0-4.97-4.03-9-9-9Zm0 17.88C9.14 17.1 5 13.61 5 11c0-3.86 3.14-7 7-7s7 3.14 7 7c0 2.61-4.14 6.1-7 8.88ZM12 6a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
                />
              </svg>
              {displayData.displayDistance}
            </span>
            {food_item.image_url && !imgError ? (
              <Image
                src={food_item.image_url}
                alt={food_item.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover"
                loading="lazy"
                quality={75}
                onError={handleImageError}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <Image
                  src="/images/placeholder.svg"
                  alt={'NoImage'}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover"
                  priority={false}
                />
              </div>
            )}
          </div>
          <div>
            <h3 className="truncate font-bold text-gray-900 text-lg mb-1 leading-tight">
              {food_item.name || t('components.donationCard.untitledItem')}
            </h3>
            <div className="flex items-center gap-1 text-base text-gray-700 mb-1 truncate">
              <span>
                {displayData.numericQuantity}
                {displayData.displayUnit}
              </span>
              <span className="mx-1">·</span>
              <span className="text-gray-500 truncate">
                {t('pages.donate.detail.from')} {displayData.displayDonor}
              </span>
            </div>
            <div className="text-xs text-gray-500 truncate">
              {formattedPickupTime}
            </div>
          </div>
        </div>
      </Link>
    );
  }
);

DonationCard.displayName = 'DonationCard';

export default DonationCard;
