import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

type DonationWithFoodItem = {
  id: string;
  food_item: {
    name: string;
    description: string;
    image_url: string | null;
    expiry_date: string;
  };
  quantity: number;
  status: string;
  pickup_time: string;
  created_at: string;
};

type DonationCardProps = {
  donation: DonationWithFoodItem;
};

const DonationCard: React.FC<DonationCardProps> = ({ donation }) => {
  const statusClass = (() => {
    switch (donation.status) {
      case 'available': return 'bg-positive/20 text-positive';
      case 'claimed': return 'bg-sky/10 text-info';
      case 'picked_up': return 'bg-stone/70 text-white';
      case 'cancelled': return 'bg-negative/10 text-negative';
      default: return 'bg-stone text-primary-50';
    }
  })();

  return (
    <Link href={`/donate/${donation.id}`} className="block max-w-md w-full">
      <div
        className="overflow-hidden rounded-lg bg-base shadow-[0_2px_4px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.04)] border border-primary-10 cursor-pointer max-w-md w-full"
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-body font-semibold text-primary line-clamp-1">
              {donation.food_item.name}
            </h3>
            <span
              className={cn(
                'inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium capitalize',
                statusClass
              )}
            >
              {donation.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-caption text-primary-75 mb-2 line-clamp-2">
            {donation.food_item.description}
          </p>
          <div className="text-sm text-primary-75 flex flex-col gap-1">
            <span>Pickup time: {donation.pickup_time ? new Date(donation.pickup_time).toLocaleString() : 'N/A'}</span>
            <span>Quantity: {donation.quantity ?? 'N/A'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DonationCard; 