'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import PageContainer from '@/components/layout/PageContainer';
import { SecondaryNavbar } from '@/components/ui/SecondaryNavbar';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

export default function RequestTypeSelection() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <PageContainer
      header={
        <SecondaryNavbar
          title="New Request"
          backHref="/receiver/dashboard"
          onBackClick={() => router.back()}
        />
      }
      className="bg-white"
      contentClassName="p-4 space-y-6"
    >
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-titleSm text-primary mb-2">
            What type of request do you want to create?
          </h2>
          <p className="text-body text-secondary">
            Choose the type that best fits your needs
          </p>
        </div>

        <div className="space-y-4">
          {/* One-time Request */}
          <button
            onClick={() => router.push('/request/one-time-form')}
            className="w-full p-6 border border-border rounded-md bg-base hover:bg-cloud transition-colors text-left group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-positive/20">
                  <Clock className="w-6 h-6 text-positive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-bodyLg font-semibold text-primary mb-1">
                    One-time Request
                  </h3>
                  <p className="text-body text-secondary">
                    Create a single request for immediate food needs
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-secondary group-hover:text-primary transition-colors mt-3" />
            </div>
          </button>

          {/* Recurring Request */}
          <button
            onClick={() => router.push('/request/recurring-form')}
            className="w-full p-6 border border-border rounded-md bg-base hover:bg-cloud transition-colors text-left group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-interactive/20">
                  <Calendar className="w-6 h-6 text-interactive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-bodyLg font-semibold text-primary mb-1">
                    Recurring Request
                  </h3>
                  <p className="text-body text-secondary">
                    Set up a repeating schedule for ongoing food needs
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-secondary group-hover:text-primary transition-colors mt-3" />
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-cloud rounded-md">
          <p className="text-label text-secondary">
            <strong>Note:</strong> You can create multiple requests based on
            your needs. Each request will be matched with available donations.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
