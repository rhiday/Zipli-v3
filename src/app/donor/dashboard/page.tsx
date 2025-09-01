'use client';

import { useCommonTranslation } from '@/hooks/useTranslations';

export default function DonorDashboard() {
  const { t } = useCommonTranslation();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{t('dashboard.donor.title')}</h1>
      <p>{t('dashboard.donor.welcome')}</p>
      <ul className="list-disc pl-6 mt-4">
        <li>{t('dashboard.donor.listAvailableFood')}</li>
        <li>{t('dashboard.donor.createNewDonations')}</li>
        <li>{t('dashboard.donor.trackDonationStatus')}</li>
        <li>{t('dashboard.donor.managePickupSchedules')}</li>
      </ul>
    </div>
  );
}
