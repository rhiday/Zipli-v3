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

export default function NewDonationPage() {
  const [serverError, setServerError] = useState<string | null>(null);

  const handleProcessComplete = (data: any) => {
    console.log('Donation data processed:', data);
    // TODO: Redirect to the next step with the data
  };

    return (
    <div className="flex flex-col min-h-screen bg-white max-w-md mx-auto">
      <SecondaryNavbar title="Create a donation" backHref="/donate">
        <div className="absolute left-0 bottom-0 w-full px-4">
          <Progress value={25} className="h-2 w-full" />
        </div>
      </SecondaryNavbar>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
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