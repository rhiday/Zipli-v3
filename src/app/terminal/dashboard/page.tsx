'use client';

import { useCommonTranslation } from '@/hooks/useTranslations';

export default function TerminalDashboard() {
  const { t } = useCommonTranslation();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        {t('dashboard.terminal.title')}
      </h1>
      <p>{t('dashboard.terminal.welcome')}</p>
      <ul className="list-disc pl-6 mt-4">
        <li>{t('dashboard.terminal.processLargeScaleDonations')}</li>
        <li>{t('dashboard.terminal.coordinateMultipleDonors')}</li>
        <li>{t('dashboard.terminal.manageFoodStorageDistribution')}</li>
        <li>{t('dashboard.terminal.trackProcessingCenterCapacity')}</li>
      </ul>
    </div>
  );
}
