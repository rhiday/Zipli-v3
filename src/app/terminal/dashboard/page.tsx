'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TerminalUIShell } from '@/components/terminal/TerminalUIShell';
import { useDatabase } from '@/store';
import { useCommonTranslation } from '@/lib/i18n-enhanced';
import { supabase } from '@/lib/supabase/client';
import { isTestData } from '@/lib/data-filters';
import { Calendar, Package, Truck } from 'lucide-react';

type UpcomingEvent = {
  id: string;
  type: 'donation' | 'request';
  title: string;
  organization: string;
  when: string; // ISO string
  pickupDate: string | null; // ISO string for delivery pickup date
  requestDate: string | null; // ISO string for request date
  status: string;
};

export default function TerminalOverview() {
  const router = useRouter();
  const { currentUser, isInitialized } = useDatabase();
  const { t } = useCommonTranslation();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);

  const loadUpcoming = useCallback(async () => {
    if (!isInitialized || !currentUser) return;
    setLoading(true);
    try {
      const [donationsResponse, requestsResponse] = await Promise.all([
        supabase
          .from('donations')
          .select(
            `*, food_items (*), profiles!donor_id (full_name, organization_name, email)`
          ),
        supabase
          .from('requests')
          .select(`*, profiles (full_name, organization_name, email)`),
      ]);

      const donations = (donationsResponse.data || []).filter(
        (d: any) =>
          !isTestData(d.profiles?.email, d.profiles?.organization_name)
      );
      const requests = (requestsResponse.data || []).filter(
        (r: any) =>
          !isTestData(r.profiles?.email, r.profiles?.organization_name)
      );

      const toDate = (value?: string | null) =>
        value ? new Date(value) : null;

      const combineDateTime = (
        dateStr?: string | null,
        timeStr?: string | null
      ) => {
        if (!dateStr || !timeStr) return null;
        try {
          const [h, m] = (timeStr as string)
            .split(':')
            .map((v) => parseInt(v, 10));
          const d = new Date(dateStr as string);
          if (isNaN(d.getTime())) return null;
          d.setHours(h || 0, m || 0, 0, 0);
          return d;
        } catch {
          return null;
        }
      };

      const readSlot = (slot: any): Date | null => {
        if (!slot) return null;
        // Support different shapes: {date, start_time} or {date, start}
        if (slot.date && (slot.start_time || slot.start)) {
          return combineDateTime(slot.date, slot.start_time || slot.start);
        }
        // Sometimes donation has a single ISO datetime under slot.start
        if (
          slot.start &&
          typeof slot.start === 'string' &&
          slot.start.includes('T')
        ) {
          const d = new Date(slot.start);
          return isNaN(d.getTime()) ? null : d;
        }
        return null;
      };

      const donationEvents: UpcomingEvent[] = donations
        .map((d: any) => {
          const slot0 = Array.isArray(d.pickup_slots)
            ? d.pickup_slots[0]
            : null;
          const whenDate: Date | null =
            // Explicit datetime
            (d.pickup_time ? toDate(d.pickup_time) : null) ||
            // Slot-based
            readSlot(slot0) ||
            // Fallback: created time (acts as last resort)
            toDate(d.created_at);
          const when = whenDate ? whenDate.toISOString() : d.created_at;

          // Extract pickup date (for donations, this is the delivery pickup date)
          const pickupDate = whenDate
            ? whenDate.toISOString()
            : d.pickup_time || null;

          // Request date is when the donation was created
          const requestDate = d.created_at;

          return {
            id: d.id,
            type: 'donation' as const,
            title: d.food_items?.name || 'Food Donation',
            organization:
              d.profiles?.organization_name ||
              d.profiles?.full_name ||
              'Unknown',
            when,
            pickupDate,
            requestDate,
            status: d.status || 'available',
          };
        })
        .filter((e) => !!e.when);

      const requestEvents: UpcomingEvent[] = requests
        .map((r: any) => {
          const whenDate: Date | null =
            // Combine pickup_date + start_time when available
            (r.pickup_date && r.pickup_start_time
              ? combineDateTime(r.pickup_date, r.pickup_start_time)
              : null) || toDate(r.created_at);
          const when = whenDate ? whenDate.toISOString() : r.created_at;

          // For requests, pickup date is the scheduled pickup date
          const pickupDate =
            r.pickup_date && r.pickup_start_time
              ? combineDateTime(
                  r.pickup_date,
                  r.pickup_start_time
                )?.toISOString() || null
              : null;

          // Request date is when the request was created
          const requestDate = r.created_at;

          return {
            id: r.id,
            type: 'request' as const,
            title: r.description?.split(' | ')[0] || 'Food Request',
            organization:
              r.profiles?.organization_name ||
              r.profiles?.full_name ||
              'Unknown',
            when,
            pickupDate,
            requestDate,
            status: r.status || 'active',
          };
        })
        .filter((e) => !!e.when);

      const now = Date.now();
      const combined = [...donationEvents, ...requestEvents]
        .filter((e) => {
          const d = toDate(e.when);
          return d ? d.getTime() >= now - 24 * 60 * 60 * 1000 : false; // allow up to 24h past for visibility
        })
        .sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime())
        .slice(0, 10);

      setEvents(combined);
    } catch (err) {
      console.error('Failed to load upcoming events', err);
    } finally {
      setLoading(false);
    }
  }, [isInitialized, currentUser]);

  useEffect(() => {
    loadUpcoming();
    const id = setInterval(loadUpcoming, 30000);
    return () => clearInterval(id);
  }, [loadUpcoming]);

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-cloud flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'terminals') {
    router.push('/auth/login');
    return null;
  }

  return (
    <TerminalUIShell>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            {t('dashboard')}
          </h1>
          <p className="text-gray-600">{t('terminalOverviewSubtitle')}</p>
        </div>
      </div>

      {/* Upcoming */}
      <section className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('upcoming')}
              </h2>
              <p className="text-gray-600 text-sm">
                {t('nextPickupsDeliveries')}
              </p>
            </div>

            {events.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                {t('noUpcomingItems')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pickup Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((e) => {
                      const formatDate = (dateStr: string | null) => {
                        if (!dateStr) return '-';
                        const d = new Date(dateStr);
                        if (isNaN(d.getTime())) return '-';
                        return (
                          d.toLocaleDateString('en-FI', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                          }) +
                          ' ' +
                          d.toLocaleTimeString('en-FI', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        );
                      };

                      return (
                        <tr key={e.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                                  e.type === 'donation'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {e.type === 'donation' ? (
                                  <Package className="w-4 h-4" />
                                ) : (
                                  <Truck className="w-4 h-4" />
                                )}
                              </div>
                              <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                                {e.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {e.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {e.organization}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(e.pickupDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(e.requestDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                              {e.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </TerminalUIShell>
  );
}
