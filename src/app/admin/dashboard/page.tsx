'use client';

/**
 * Admin Dashboard Page
 * Provides overview and management of the entire application
 */
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCommonTranslation } from '@/hooks/useTranslations';

export default function AdminDashboardPage(): React.ReactElement {
  const { t } = useCommonTranslation();
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          {t('dashboard.admin.title')}
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              {t('admin.users.title')}
            </h2>
            <p className="mb-4 text-gray-600">{t('admin.users.description')}</p>
            <Button
              onClick={() => router.push('/admin/users')}
              className="w-full bg-green-700 hover:bg-green-600"
            >
              {t('admin.users.manageUsers')}
            </Button>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              {t('admin.donations.title')}
            </h2>
            <p className="mb-4 text-gray-600">
              {t('admin.donations.description')}
            </p>
            <Button
              onClick={() => router.push('/admin/donations')}
              className="w-full bg-green-700 hover:bg-green-600"
            >
              {t('admin.donations.manageDonations')}
            </Button>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              {t('admin.requests.title')}
            </h2>
            <p className="mb-4 text-gray-600">
              {t('admin.requests.description')}
            </p>
            <Button
              onClick={() => router.push('/admin/requests')}
              className="w-full bg-green-700 hover:bg-green-600"
            >
              {t('admin.requests.manageRequests')}
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            {t('admin.statistics.title')}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-md bg-gray-50 p-4">
              <h3 className="text-sm font-medium text-gray-500">
                {t('admin.statistics.totalUsers')}
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-800">-</p>
            </div>
            <div className="rounded-md bg-gray-50 p-4">
              <h3 className="text-sm font-medium text-gray-500">
                {t('admin.statistics.activeDonations')}
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-800">-</p>
            </div>
            <div className="rounded-md bg-gray-50 p-4">
              <h3 className="text-sm font-medium text-gray-500">
                {t('admin.statistics.pendingRequests')}
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-800">-</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
