'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Progress } from '@/components/ui/progress';
import { ItemPreview } from '@/components/ui/ItemPreview';
import { Textarea } from '@/components/ui/Textarea';
import { format } from 'date-fns';
import { useDonationStore } from '@/store/donation';

export default function DonationSummaryPage() {
  const router = useRouter();
  const { donationItems, pickupSlots } = useDonationStore();
  const [address, setAddress] = useState('');
  const [driverInstructions, setDriverInstructions] = useState('');

  const handleEditItem = (id: string) => {
    // Navigate to manual page with item id to edit
    router.push(`/donate/manual?edit=${id}`);
  };

  const handleEditSchedule = () => {
    router.push('/donate/pickup-slot');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto">
      <SecondaryNavbar title="Donation summary" backHref="/donate/pickup-slot" />
      <div className="px-6 pt-2">
        <Progress value={75} className="h-2 w-full" />
      </div>

      <main className="flex-1 flex flex-col gap-8 p-6">
        {/* Donation Items Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-[#021d13]">Donation items</h2>
          {donationItems.map((item) => (
            <ItemPreview
              key={item.id}
              name={item.name}
              quantity={item.quantity}
              imageUrl={item.imageUrl}
              onEdit={() => handleEditItem(item.id)}
            />
          ))}
        </div>

        {/* Pickup Schedule Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-[#021d13]">Pickup schedule</h2>
          {pickupSlots.map(slot => (
            <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg bg-[#F5F9EF] border border-[#D9DBD5]">
              <span className="font-semibold text-interactive">
                {slot.date ? `${format(slot.date, 'dd.M.yyyy')}, ${slot.startTime} - ${slot.endTime}` : ''}
              </span>
              <button onClick={handleEditSchedule} className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5" aria-label="Edit schedule">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.0041 3.71165C12.2257 3.49 12.5851 3.49 12.8067 3.71165L15.8338 6.7387C16.0554 6.96034 16.0554 7.31966 15.8338 7.5413L5.99592 17.3792C5.88954 17.4856 5.74513 17.5454 5.59462 17.5454H2.56757C2.25413 17.5454 2 17.2913 2 16.9778V13.9508C2 13.8003 2.05977 13.6559 2.16615 13.5495L12.0041 3.71165ZM10.9378 6.38324L13.1622 8.60762L14.6298 7.14L12.4054 4.91562L10.9378 6.38324ZM12.3595 9.41034L10.1351 7.18592L3.13513 14.1859V16.4103H5.35949L12.3595 9.41034Z" fill="#024209"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Address & Instructions Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-[#021d13]">Delivery details</h2>
          <div>
            <label htmlFor="address" className="block text-label font-semibold mb-2">Address</label>
            <Textarea
              id="address"
              placeholder="Enter your full address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label htmlFor="driver-instructions" className="block text-label font-semibold mb-2">Instructions for driver</label>
            <Textarea
              id="driver-instructions"
              placeholder="e.g. Please ring the doorbell"
              value={driverInstructions}
              onChange={(e) => setDriverInstructions(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 left-0 w-full bg-white pt-4 pb-10 pr-6 flex justify-end z-10">
        <button 
          onClick={() => { /* TODO: Implement confirmation logic */ }}
          disabled={!address.trim()}
          className="bg-[#a6f175] text-[#021d13] font-manrope font-semibold rounded-full px-8 py-3 text-lg shadow-md hover:bg-[#c2f7a1] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm donation
        </button>
      </div>
    </div>
  );
} 