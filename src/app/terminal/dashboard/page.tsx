'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store';
import { useCommonTranslation } from '@/lib/i18n-enhanced';
import { supabase } from '@/lib/supabase/client';
import { TerminalUIShell } from '@/components/terminal/TerminalUIShell';
import { isTestData } from '@/lib/data-filters';
import { DatePicker } from '@/components/ui/DatePicker';
import {
  Truck,
  Download,
  Filter,
  Calendar,
  Package,
  FileText,
  Eye,
  Activity,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Unified type for terminal operations
type TerminalItem = {
  id: string;
  created_at: string;
  type: 'donation' | 'request';
  item_name: string;
  organization_name: string;
  category: string;
  food_category?: string; // Food category like "Bakery", "Produce", etc.
  quantity: string;
  status: string;
  processing_status?: 'received' | 'processing' | 'dispatched';
  urgency?: 'low' | 'medium' | 'high';
  location: string;
  time_info: string;
  date_info?: string;
  route_id?: string;
  is_recurring?: boolean;
  raw_data: any; // Keep original data for modals
};

export default function TerminalOverview() {
  const router = useRouter();
  const { currentUser, isInitialized } = useDatabase();
  const { t } = useCommonTranslation();

  const [loading, setLoading] = useState(true);
  const [terminalItems, setTerminalItems] = useState<TerminalItem[]>([]);
  // Search removed per design change
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [sortKey, setSortKey] = useState<'date' | 'name' | 'org' | 'qty'>(
    'date'
  );
  const [selectedItem, setSelectedItem] = useState<TerminalItem | null>(null);

  // Terminal-specific analytics
  const analytics = useMemo(() => {
    const donations = terminalItems.filter((item) => item.type === 'donation');
    const requests = terminalItems.filter((item) => item.type === 'request');

    const totalVolume = donations.reduce((sum, d) => {
      const quantity = parseFloat(d.quantity.replace(/[^\d.]/g, '')) || 0;
      return sum + quantity;
    }, 0);

    const processingItems = donations.filter(
      (d) => d.processing_status === 'processing'
    ).length;

    const dispatchedItems = donations.filter(
      (d) => d.processing_status === 'dispatched'
    ).length;

    const activeRoutes = new Set(
      terminalItems.map((item) => item.route_id).filter(Boolean)
    ).size;

    // Calculate utilization percentage based on daily processing capacity
    const maxCapacity = 500; // kg per day - realistic terminal capacity
    const utilization =
      totalVolume > 0
        ? Math.min(100, Math.round((totalVolume / maxCapacity) * 100))
        : 0;

    return {
      volumeProcessed: `${totalVolume.toFixed(1)}kg`,
      storageUtilization: `${utilization}%`,
      processingEfficiency:
        donations.length > 0
          ? `${Math.round((dispatchedItems / donations.length) * 100)}%`
          : '0%',
      activeRoutes,
    };
  }, [terminalItems]);

  // Load data with network optimization
  const loadData = useCallback(async () => {
    if (!isInitialized || !currentUser) return;

    setLoading(true);
    try {
      // Get real data from Supabase
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
        setLoading(false);
        return;
      }

      if (requestsResponse.error) {
        console.error('Error fetching requests:', requestsResponse.error);
        setLoading(false);
        return;
      }

      const donationsData = donationsResponse.data || [];
      const requestsData = requestsResponse.data || [];

      // Filter out test data before transformation
      const filteredDonations = donationsData.filter(
        (d: any) =>
          !isTestData(d.profiles?.email, d.profiles?.organization_name)
      );
      const filteredRequests = requestsData.filter(
        (r: any) =>
          !isTestData(r.profiles?.email, r.profiles?.organization_name)
      );

      // Transform data into unified structure
      const transformedDonations: TerminalItem[] = filteredDonations.map(
        (d: any) => {
          const processing_status =
            d.status === 'picked_up' || d.status === 'completed'
              ? 'dispatched'
              : d.status === 'claimed' || d.status === 'in_progress'
                ? 'processing'
                : d.status === 'available' || d.status === 'posted'
                  ? 'received'
                  : 'received';

          const dateInfo =
            d.pickup_slots?.[0]?.date ||
            d.pickup_date ||
            new Date(d.created_at).toISOString();

          return {
            id: d.id,
            created_at: d.created_at,
            type: 'donation' as const,
            item_name: d.food_items?.name || 'Food Donation',
            organization_name:
              d.profiles?.organization_name ||
              d.profiles?.full_name ||
              'Unknown Donor',
            category: 'Donation',
            food_category: d.food_items?.category || 'Other',
            quantity: `${parseFloat(d.quantity) || 0}${d.unit || 'kg'}`,
            status: d.status,
            processing_status,
            location:
              d.address ||
              `${d.profiles?.organization_name || 'Unknown'} Location`,
            time_info:
              d.pickup_slots?.[0]?.start_time ||
              d.pickup_start_time ||
              new Date(d.created_at).toLocaleTimeString('en-FI', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            date_info: new Date(dateInfo).toLocaleDateString('en-FI', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
            route_id: d.id.slice(-8),
            raw_data: d,
          };
        }
      );

      const transformedRequests: TerminalItem[] = filteredRequests.map(
        (r: any) => ({
          id: r.id,
          created_at: r.created_at,
          type: 'request' as const,
          item_name: r.description || 'Food Request',
          organization_name:
            r.profiles?.organization_name ||
            r.profiles?.full_name ||
            'Unknown Receiver',
          category: 'Request',
          quantity: `${r.people_count || 0} people`,
          status: r.status,
          urgency: r.priority || 'medium',
          location:
            r.address ||
            `${r.profiles?.organization_name || 'Unknown'} Location`,
          time_info:
            r.pickup_start_time && r.pickup_end_time
              ? `${r.pickup_start_time}-${r.pickup_end_time}`
              : new Date(r.created_at).toLocaleTimeString('en-FI', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
          date_info: new Date(r.pickup_date || r.created_at).toLocaleDateString(
            'en-FI',
            {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }
          ),
          is_recurring: r.is_recurring || false,
          raw_data: r,
        })
      );

      // Combine and sort by creation date (most recent first)
      const allItems = [...transformedDonations, ...transformedRequests].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setTerminalItems(allItems);
    } catch (error) {
      console.error('Failed to load terminal dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [isInitialized, currentUser]);

  // Auto-refresh every 30 seconds for terminal operations
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Filter function for unified items
  const filteredItems = useMemo(() => {
    return terminalItems
      .filter((item) => {
        const matchesType = typeFilter === 'all' || item.type === typeFilter;

        const matchesStatus =
          statusFilter === 'all' ||
          item.status === statusFilter ||
          (item.processing_status && item.processing_status === statusFilter);

        // Date filtering
        const itemDate = new Date(item.created_at);
        const matchesStartDate = !startDate || itemDate >= startDate;
        const matchesEndDate = !endDate || itemDate <= endDate;

        const pass =
          matchesType && matchesStatus && matchesStartDate && matchesEndDate;
        return pass;
      })
      .sort((a, b) => {
        if (sortKey === 'name') {
          return a.item_name.localeCompare(b.item_name);
        }
        if (sortKey === 'org') {
          return a.organization_name.localeCompare(b.organization_name);
        }
        if (sortKey === 'qty') {
          const qa = parseFloat(String(a.quantity).replace(/[^\d.]/g, '')) || 0;
          const qb = parseFloat(String(b.quantity).replace(/[^\d.]/g, '')) || 0;
          return qb - qa; // larger first
        }
        // date
        const da = new Date(a.created_at).getTime();
        const db = new Date(b.created_at).getTime();
        return db - da; // newest first
      });
  }, [terminalItems, typeFilter, statusFilter, startDate, endDate, sortKey]);

  // PDF Export function (lightweight)
  const handlePrintExport = useCallback(() => {
    window.print();
  }, []);

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
      {/* Page Header: Welcome below the navbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {t('welcomeBack')},{' '}
              {currentUser?.organization_name ||
                currentUser?.full_name ||
                'Terminal'}
            </h1>
            <p className="text-gray-600">{t('currentStatusAndMetrics')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('en-FI', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <section className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('volumeProcessed')}
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {analytics.volumeProcessed}
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('storageUtilization')}
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {analytics.storageUtilization}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('processingEfficiency')}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {analytics.processingEfficiency}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t('activeRoutes')}
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {analytics.activeRoutes}
                  </p>
                </div>
                <Truck className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters (search removed) */}
      <section className="px-6 pb-6">
        <div className="max-w-7xl mx-auto bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search removed */}

            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                placeholder="Start date"
                className="w-40"
              />
              <span className="text-gray-400">to</span>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                placeholder="End date"
                className="w-40"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('allTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                <SelectItem value="donation">
                  {t('donations') || 'Donations'}
                </SelectItem>
                <SelectItem value="request">{t('requests')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={t('allStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatus')}</SelectItem>
                <SelectItem value="received">{t('received')}</SelectItem>
                <SelectItem value="processing">{t('processing')}</SelectItem>
                <SelectItem value="dispatched">{t('dispatched')}</SelectItem>
                <SelectItem value="active">{t('active')}</SelectItem>
                <SelectItem value="fulfilled">
                  {t('terminalFulfilled')}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Sort by */}
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as any)}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder={t('sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">{t('sortByDate')}</SelectItem>
                <SelectItem value="name">{t('sortByItemName')}</SelectItem>
                <SelectItem value="org">{t('sortByOrganization')}</SelectItem>
                <SelectItem value="qty">{t('sortByQuantity')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button variant="secondary" onClick={handlePrintExport}>
              <Download className="w-4 h-4 mr-2" />
              {t('exportData')}
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content - Table Layout */}
      <section className="px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Terminal Operations ({filteredItems.length} items)
              </h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-28">
                      {t('date') || 'Date'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-48">
                      Item Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-24">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-24">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-40">
                      Organization
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-32">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {item.date_info ||
                          new Date(item.created_at).toLocaleDateString(
                            'en-FI',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            }
                          )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {item.item_name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.type === 'donation'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {item.type === 'donation' ? (
                            <Package className="w-3 h-3 mr-1" />
                          ) : (
                            <Truck className="w-3 h-3 mr-1" />
                          )}
                          {item.category}
                        </span>
                      </td>
                      {/* Ruoka Category column removed as requested */}
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.organization_name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.processing_status === 'dispatched' ||
                              item.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : item.processing_status === 'processing' ||
                                    item.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {item.processing_status || item.status}
                          </span>
                          {item.urgency && (
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.urgency === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : item.urgency === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {item.urgency}
                            </span>
                          )}
                          {item.is_recurring && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Recurring
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredItems.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p>No items match your current filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.type === 'donation'
                ? 'Donation Details'
                : 'Request Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Item Name
                  </label>
                  <p className="text-gray-900">{selectedItem.item_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Category
                  </label>
                  <p className="text-gray-900">{selectedItem.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Organization
                  </label>
                  <p className="text-gray-900">
                    {selectedItem.organization_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Quantity
                  </label>
                  <p className="text-gray-900">{selectedItem.quantity}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <p className="text-gray-900 capitalize">
                    {selectedItem.status}
                  </p>
                </div>
                {selectedItem.processing_status && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Processing Status
                    </label>
                    <p className="text-gray-900 capitalize">
                      {selectedItem.processing_status}
                    </p>
                  </div>
                )}
              </div>

              {selectedItem.urgency && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Urgency
                  </label>
                  <p
                    className={`capitalize font-medium ${
                      selectedItem.urgency === 'high'
                        ? 'text-red-600'
                        : selectedItem.urgency === 'medium'
                          ? 'text-yellow-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {selectedItem.urgency}
                  </p>
                </div>
              )}

              {/* Location and time are not shown in terminal modal per design */}
              {selectedItem.route_id && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Route ID
                  </label>
                  <p className="text-gray-900">{selectedItem.route_id}</p>
                </div>
              )}

              {selectedItem.is_recurring && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Recurring
                  </label>
                  <p className="text-gray-900">Yes, this is a recurring item</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-break {
            page-break-after: always;
          }
        }
      `}</style>
    </TerminalUIShell>
  );
}
