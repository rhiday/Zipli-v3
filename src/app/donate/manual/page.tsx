'use client';
import { Suspense } from 'react';
import { useCommonTranslation } from '@/hooks/useTranslations';
import { ManualDonationForm } from '@/components/donation/ManualDonationForm';

function ManualDonationPageInner() {
  return <ManualDonationForm />;
}

function ManualDonationPage() {
  const { t } = useCommonTranslation();
  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
      <ManualDonationPageInner />
    </Suspense>
  );
}

export default ManualDonationPage;
