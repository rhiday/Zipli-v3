import React from 'react';
import { cn } from '@/lib/utils';

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
  onClick?: () => void;
};

const DonationCard: React.FC<DonationCardProps> = ({ donation, onClick }) => {
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
    <div
      className="overflow-hidden rounded-lg bg-base shadow-[0_2px_4px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.04)] border border-primary-10 cursor-pointer"
      onClick={onClick}
    >
      {donation.food_item.image_url && (
        <img
          src={donation.food_item.image_url}
          alt={donation.food_item.name}
          className="h-32 w-full object-cover"
        />
      )}
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
        <p className="text-caption text-primary-50">
          Expires: {new Date(donation.food_item.expiry_date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default DonationCard; 