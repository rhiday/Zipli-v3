'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { NextSteps } from '@/components/ui/NextSteps';
import { useLanguage } from '@/hooks/useLanguage';

export default function RequestSuccessPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="text-center max-w-md w-full">
        <CheckCircle className="text-positive mx-auto h-16 w-16 mb-6" />
        <h1 className="text-titleMd md:text-titleLg font-display text-primary mb-4">{t('requestSubmitted')}</h1>
        <p className="text-body text-primary-75 mb-6">{t('requestAddedToSystem')}</p>

        <NextSteps
          heading={t('nextSteps')}
          steps={[
            { title: t('requestSubmitted'), description: t('requestAddedToSystem') },
            { title: t('matchingInProgress'), description: t('lookingForMatches') },
            { title: t('getNotified'), description: t('receiveNotificationWhenMatch') },
          ]}
          className="text-left mb-6"
        />
        <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-row sm:justify-center sm:space-x-4">
          <Link href="/donate/all-offers?type=requests" passHref>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 whitespace-nowrap">{t('browseFood')}</Button>
          </Link>
          <Link href="/feed" passHref>
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 whitespace-nowrap">{t('exploreAvailableDonations')}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 