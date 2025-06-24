'use client';

import React, { useState } from 'react';
import { VoiceInputControl } from '@/components/ui/VoiceInputControl';
import Link from 'next/link';
import { Pencil, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BackArrowIcon } from '@/components/ui/icons/BackArrowIcon';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { ActionButton } from '@/components/ui/action-button';
import { useRouter } from 'next/navigation';
import { useDonationStore } from '@/store/donation';

export default function NewDonationPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const { donationItems, setDonationItems, setPickupSlots } = useDonationStore();

  const handleProcessComplete = (data: any) => {
    if (!data || !Array.isArray(data.items)) {
      setServerError('Could not extract donation items from your voice input. Please try again or type manually.');
      return;
    }
    // Map new items
    const newItems = data.items.map((item: any, idx: number) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${idx}`,
      name: item.name,
      quantity: item.quantity,
      allergens: Array.isArray(item.allergens) ? item.allergens : [],
      imageUrl: undefined,
    }));
    // Append to existing items
    setDonationItems([...donationItems, ...newItems]);
    router.push('/donate/manual');
  };

    return (
      <div className="min-h-screen pb-20">
        <SecondaryNavbar title="Create a donation" backHref="/donate">
          <div className="absolute left-0 bottom-0 w-full px-4">
            <Progress value={25} className="h-2 w-full" />
          </div>
        </SecondaryNavbar>

        <main className="relative z-20 -mt-4 rounded-t-3xl bg-base p-4 space-y-6">
          <div className="w-full flex flex-col items-center">
            <VoiceInputControl
              onProcessComplete={handleProcessComplete}
              setServerError={setServerError}
            />
          </div>
          {serverError && <p className="text-red-500 mt-4">{serverError}</p>}
        </main>

        <footer className="p-4 bg-white pb-24">
          <ActionButton
            href="/donate/manual"
            title="Type donation manually"
            description="It only takes a few minutes"
            icon={<Pencil className="w-6 h-6" />}
            className="mt-8"
          />
        </footer>
      </div>
    );
} 