'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageIcon, MapPinIcon, ShoppingBag } from 'lucide-react';
import { DonationWithFoodItem } from '@/store/databaseStore';
import { CardContent } from '@/components/ui/card';

interface DonationCardProps {
  donation: DonationWithFoodItem;
  className?: string;
}

const DonationCard: React.FC<DonationCardProps> = ({ donation, className }) => {
  if (!donation || !donation.food_item) {
    return null;
  }

  const { id, food_item, quantity } = donation;

  const formatPickupTime = (time: string | undefined) => {
    if (!time) return 'Available now';
    try {
      const date = new Date(time);
      return `Until ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    } catch (e) {
      return 'Invalid time';
    }
  };

  return (
    <Link href={`/donate/detail/${id}`} className="block group">
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 ease-in-out group-hover:shadow-md group-hover:-translate-y-0.5',
          className
        )}
      >
        <div className="relative h-32 w-full">
          {food_item.image_url ? (
            <Image
              src={food_item.image_url}
              alt={food_item.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <ImageIcon className="h-12 w-12 text-gray-300" />
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="truncate font-semibold text-gray-800">
            {food_item.name || 'Untitled Item'}
          </h3>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <ShoppingBag className="mr-1.5 h-4 w-4" />
            <span>
              {quantity || '0'} kg ·{' '}
              {
                Array.isArray(food_item.allergens)
                  ? food_item.allergens.length
                  : (food_item.allergens?.split(',').length || 0)
              } Allergens
            </span>
          </div>
          <p className="mt-1.5 text-sm text-gray-500">
            {formatPickupTime(undefined)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default DonationCard;