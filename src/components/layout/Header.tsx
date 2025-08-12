'use client';

import React from 'react';
import Image from 'next/image';
import { Languages, MessageSquare, UserCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store/databaseStore';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { currentUser, isInitialized, donations: allDonations, foodItems } = useDatabase();
  const router = useRouter();
  const { t } = useLanguage();

  // Get donations for the current user, sorted by latest creation time
  const donationItems = isInitialized && currentUser
    ? allDonations
        .filter(d => d.donor_id === currentUser.id && (d.status === 'available' || d.status === 'claimed'))
        .slice()
        .sort((a, b) => {
          // Fallback to pickup_time if created_at is not available (for existing donations)
          const aTime = a.created_at ? new Date(a.created_at).getTime() : (a.pickup_time ? new Date(a.pickup_time).getTime() : 0);
          const bTime = b.created_at ? new Date(b.created_at).getTime() : (b.pickup_time ? new Date(b.pickup_time).getTime() : 0);
          return bTime - aTime;
        })
        .map(d => {
          const foodItem = foodItems.find(fi => fi.id === d.food_item_id);
          return {
            id: d.id,
            quantity: d.quantity,
            name: foodItem?.name || 'Unknown Item',
            created_at: d.created_at,
          };
        })
    : [];

  // Debug: log the creation time order
  console.log('Activity list order:', donationItems.map(d => d.created_at));

  const [showAll, setShowAll] = React.useState(false);
  const maxVisible = 4;
  const visibleItems = showAll ? donationItems : donationItems.slice(0, maxVisible);
  const hiddenCount = donationItems.length - maxVisible;

  return (
    <div className="relative w-full bg-green-800 text-white px-4 pt-10 pb-6 shadow-lg overflow-hidden mb-8">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white/80">{t('goodToSeeYou')}</p>
          <h1 className="text-4xl font-bold text-white mt-1">{title || currentUser?.full_name || ''}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-[#F3F4ED] rounded-full flex items-center gap-1.5 text-sm">
            <Languages className="w-4 h-4 text-white" />
            English
          </button>
          <button className="w-10 h-10 border border-[#F3F4ED] rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </button>
          <Link 
            href="/profile" 
            className="w-10 h-10 border border-[#F3F4ED] rounded-full flex items-center justify-center"
          >
            <UserCircle className="w-5 h-5 text-white" />
          </Link>
        </div>
      </div>

      {/* Activity Section */}
      <div
        className={cn(
          "w-full max-w-xl mt-6 rounded-2xl p-6 flex flex-col gap-3",
          donationItems.length > 0 && "bg-[rgba(166,241,117,0.10)] border border-[#18E170]"
        )}
      >
        {donationItems.length === 0 ? (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#18E170] rounded-full shrink-0"></span>
            <span className="text-white/80">You don't have any active donations or requests</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 bg-[#18E170] rounded-full"></span>
              <span className="text-white font-semibold text-base">Your activity</span>
            </div>
            <ul className="flex flex-col">
              {visibleItems.map((item, idx) => (
                <li
                  key={item.id}
                  className={
                    cn(
                      "flex justify-between items-center w-full py-3 border-b border-white/30 last:border-b-0"
                    )
                  }
                >
                  <div>
                    <span className="text-sm font-semibold text-white">Donation</span>
                    <span className="text-white/90 text-sm ml-1">· {item.quantity} kg, {item.name}</span>
                  </div>
                  <button
                    className="text-white font-semibold text-sm underline underline-offset-2"
                    onClick={() => router.push(`/donate/detail/${item.id}`)}
                  >
                    Detail
                  </button>
                </li>
              ))}
            </ul>
            {donationItems.length > maxVisible && (
              <button
                className="w-full flex items-center justify-center mt-2 text-white underline underline-offset-2 text-base font-medium"
                onClick={() => setShowAll(v => !v)}
              >
                {showAll ? 'Show less' : `Show ${hiddenCount} more`}
                {showAll ? (
                  <ChevronUp className="ml-2 w-4 h-4" />
                ) : (
                  <ChevronDown className="ml-2 w-4 h-4" />
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Header; 