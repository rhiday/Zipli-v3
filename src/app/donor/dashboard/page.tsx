'use client';

import { useLanguage } from '@/hooks/useLanguage';

export default function DonorDashboard() {
  const { t } = useLanguage();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{t('foodDonorDashboard')}</h1>
      <p>{t('welcomeToDonorDashboard')}</p>
      <ul className="list-disc pl-6 mt-4">
        <li>{t('listAvailableFood')}</li>
        <li>{t('createNewDonations')}</li>
        <li>{t('trackDonationStatus')}</li>
        <li>{t('managePickupSchedules')}</li>
      </ul>
    </div>
  );
} 