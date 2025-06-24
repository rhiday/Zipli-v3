'use client';

import React from 'react';
import Image from 'next/image';
import { Languages, MessageSquare, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store/databaseStore';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { currentUser, isInitialized, donations: allDonations, foodItems } = useDatabase();
  const router = useRouter();

  // Get donations for the current user
  const donationItems = isInitialized && currentUser
    ? allDonations
        .filter(d => d.donor_id === currentUser.id && (d.status === 'available' || d.status === 'claimed'))
        .map(d => {
          const foodItem = foodItems.find(fi => fi.id === d.food_item_id);
          return {
            id: d.id,
            quantity: d.quantity,
            name: foodItem?.name || 'Unknown Item',
          };
        })
    : [];

  return (
    <div className="relative w-full bg-green-800 text-white px-4 pt-10 pb-6 shadow-lg overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white/80">Good to see you!</p>
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
            <ul className="flex flex-col gap-2">
              {donationItems.map((item) => (
                <li key={item.id} className="flex justify-between items-center w-full">
                  <div>
                    <span className="font-semibold text-[#a6f175]">Donation</span>
                    <span className="text-white ml-1">· {item.quantity}, {item.name}</span>
                  </div>
                  <button
                    className="text-[#a6f175] font-medium text-sm hover:underline"
                    onClick={() => router.push(`/donate/detail/${item.id}`)}
                  >
                    Detail
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default Header; 