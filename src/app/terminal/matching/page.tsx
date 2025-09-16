'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store';
import { useCommonTranslation } from '@/lib/i18n-enhanced';
import { supabase } from '@/lib/supabase/client';
import { TerminalUIShell } from '@/components/terminal/TerminalUIShell';
import { isTestData } from '@/lib/data-filters';
import {
  Package,
  Truck,
  Clock,
  MapPin,
  Eye,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type DonationItem = {
  id: string;
  created_at: string;
  item_name: string;
  organization_name: string;
  quantity: string;
  status: string;
  location: string;
  pickup_time: string;
  food_category: string;
  route_id: string;
  raw_data: any;
};

type RequestItem = {
  id: string;
  created_at: string;
  description: string;
  organization_name: string;
  people_count: number;
  status: string;
  location: string;
  delivery_time: string;
  urgency: 'low' | 'medium' | 'high';
  is_recurring: boolean;
  raw_data: any;
};

export default function TerminalMatching() {
  const router = useRouter();
  const { currentUser, isInitialized } = useDatabase();
  const { t } = useCommonTranslation();

  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);

  // Load data for matching
  const loadMatchingData = useCallback(async () => {
    if (!isInitialized || !currentUser) return;

    setLoading(true);
    try {
      const [donationsResponse, requestsResponse] = await Promise.all([
        supabase.from('donations').select(`
            *,
            food_items (*),
            profiles!donor_id (full_name, organization_name, email)
          `),
        supabase.from('requests').select(`
            *,
            profiles (full_name, organization_name, email)
          `),
      ]);

      if (donationsResponse.error) {
        console.error('Error fetching donations:', donationsResponse.error);
        return;
      }

      if (requestsResponse.error) {
        console.error('Error fetching requests:', requestsResponse.error);
        return;
      }

      const donationsData = donationsResponse.data || [];
      const requestsData = requestsResponse.data || [];

      // Filter out test data
      const filteredDonations = donationsData.filter(
        (d: any) =>
          !isTestData(d.profiles?.email, d.profiles?.organization_name)
      );
      const filteredRequests = requestsData.filter(
        (r: any) =>
          !isTestData(r.profiles?.email, r.profiles?.organization_name)
      );

      // Transform donations
      const transformedDonations: DonationItem[] = filteredDonations.map(
        (d: any) => ({
          id: d.id,
          created_at: d.created_at,
          item_name: d.food_items?.name || 'Food Donation',
          organization_name:
            d.profiles?.organization_name ||
            d.profiles?.full_name ||
            'Unknown Donor',
          quantity: `${parseFloat(d.quantity) || 0}${d.unit || 'kg'}`,
          status: d.status,
          location:
            d.address ||
            `${d.profiles?.organization_name || 'Unknown'} Location`,
          pickup_time:
            d.pickup_slots?.[0]?.start_time ||
            d.pickup_time ||
            new Date(d.created_at).toLocaleTimeString('en-FI', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          food_category: d.food_items?.category || 'Other',
          route_id: d.id.slice(-8),
          raw_data: d,
        })
      );

      // Transform requests
      const transformedRequests: RequestItem[] = filteredRequests.map(
        (r: any) => ({
          id: r.id,
          created_at: r.created_at,
          description: r.description || 'Food Request',
          organization_name:
            r.profiles?.organization_name ||
            r.profiles?.full_name ||
            'Unknown Receiver',
          people_count: r.people_count || 0,
          status: r.status,
          location:
            r.address ||
            `${r.profiles?.organization_name || 'Unknown'} Location`,
          delivery_time:
            r.pickup_start_time && r.pickup_end_time
              ? `${r.pickup_start_time}-${r.pickup_end_time}`
              : new Date(r.created_at).toLocaleTimeString('en-FI', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
          urgency: r.priority || 'medium',
          is_recurring: r.is_recurring || false,
          raw_data: r,
        })
      );

      setDonations(transformedDonations.slice(0, 10)); // Limit to recent items
      setRequests(transformedRequests.slice(0, 10)); // Limit to recent items
    } catch (error) {
      console.error('Failed to load matching data:', error);
    } finally {
      setLoading(false);
    }
  }, [isInitialized, currentUser]);

  useEffect(() => {
    loadMatchingData();
    const interval = setInterval(loadMatchingData, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, [loadMatchingData]);

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
            {t('matching')}
          </h1>
          <p className="text-gray-600">
            Sovita lahjoituksia ja pyyntöjä tehokkaan jakelun varmistamiseksi
          </p>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Donations */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b bg-blue-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 text-blue-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      {t('incomingDonations')} ({donations.length})
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-FI')}
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {donations.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>{t('noDonationsMatchFilters')}</p>
                  </div>
                ) : (
                  donations.map((donation) => (
                    <div
                      key={donation.id}
                      className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {donation.item_name}
                            </h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {donation.quantity}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-1">
                            {t('from')} {donation.organization_name}
                          </p>

                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate">
                              {donation.location}
                            </span>
                          </div>

                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{donation.pickup_time}</span>
                          </div>
                        </div>

                        <div className="ml-4 flex flex-col items-end gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              donation.status === 'available'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {donation.status}
                          </span>

                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column - Requests */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b bg-orange-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 text-orange-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      {t('deliveryRequests')} ({requests.length})
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-FI')}
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {requests.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Truck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>{t('noRequestsMatchFilters')}</p>
                  </div>
                ) : (
                  requests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {request.description}
                            </h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              {request.people_count} {t('terminalPeople')}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-1">
                            {request.organization_name}
                          </p>

                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate">{request.location}</span>
                          </div>

                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{request.delivery_time}</span>
                            {request.is_recurring && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-purple-600 font-medium">
                                  {t('recurring')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="ml-4 flex flex-col items-end gap-2">
                          <div className="flex flex-col gap-1 items-end">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                request.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {request.status}
                            </span>

                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                request.urgency === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : request.urgency === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {request.urgency}
                            </span>
                          </div>

                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Matching Actions */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sovittamisen työkalut
                </h3>
                <p className="text-gray-600">
                  Käytä alla olevia työkaluja lahjoitusten ja pyyntöjen
                  sovittamiseen
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Näytä kaikki lahjoitukset
                </Button>
                <Button variant="outline">
                  <Truck className="w-4 h-4 mr-2" />
                  Näytä kaikki pyynnöt
                </Button>
                <Button>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Luo sovittaminen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TerminalUIShell>
  );
}
