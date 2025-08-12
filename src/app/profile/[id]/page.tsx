'use client'

import React, { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDatabase } from '@/store/databaseStore';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import DonationCard from '@/components/donations/DonationCard';
import { useLanguage } from '@/hooks/useLanguage';

export default function DonorProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useLanguage();
  const { users, getDonationsByDonor } = useDatabase();

  const donorId = params?.id as string;
  const donor = users.find(u => u.id === donorId);
  const donorName = donor?.full_name || donor?.organization_name || t('generousDonor');

  const donations = useMemo(() => getDonationsByDonor(donorId), [getDonationsByDonor, donorId]);

  return (
    <div className="flex flex-col h-dvh bg-white">
      <SecondaryNavbar title={donorName} backHref="/feed" onBackClick={() => router.back()} />

      <main className="flex-grow overflow-y-auto p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-primary">{t('donations')}</h2>
          {donations.length === 0 ? (
            <p className="text-secondary mt-2">{t('noDonationsFound')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {donations.map(d => (
                <DonationCard key={d.id} donation={d} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


