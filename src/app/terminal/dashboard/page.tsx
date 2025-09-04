'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store';
import { useCommonTranslation } from '@/lib/i18n-enhanced';
import { supabase } from '@/lib/supabase/client';
import { TerminalUIShell } from '@/components/terminal/TerminalUIShell';
import { DatePicker } from '@/components/ui/DatePicker';
import {
  Truck,
  Download,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  Package,
  FileText,
  Eye,
  Activity,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
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

// Types for terminal dashboard data
type TerminalDonation = {
  id: string;
  created_at: string;
  organization_name: string;
  food_items: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  total_weight: number;
  status: 'active' | 'completed' | 'cancelled';
  processing_status: 'received' | 'processing' | 'dispatched';
  pickup_time: string;
  pickup_date: string;
  location: string;
  route_id?: string;
};

type TerminalRequest = {
  id: string;
  created_at: string;
  organization_name: string;
  description: string;
  people_count: number;
  status: 'active' | 'fulfilled' | 'cancelled';
  urgency: 'low' | 'medium' | 'high';
  location: string;
  delivery_window: string;
  is_recurring: boolean;
};

export default function TerminalDashboard() {
  const router = useRouter();
  const { currentUser, isInitialized } = useDatabase();
  const { t } = useCommonTranslation();

  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<TerminalDonation[]>([]);
  const [requests, setRequests] = useState<TerminalRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedDonation, setSelectedDonation] =
    useState<TerminalDonation | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<TerminalRequest | null>(null);

  // Terminal-specific analytics
  const analytics = useMemo(() => {
    const totalVolume = donations.reduce((sum, d) => sum + d.total_weight, 0);
    const processingItems = donations.filter(
      (d) => d.processing_status === 'processing'
    ).length;
    const dispatchedItems = donations.filter(
      (d) => d.processing_status === 'dispatched'
    ).length;
    const activeRoutes = new Set(
      [
        ...donations.map((d) => d.route_id),
        ...requests.map((r) => r.assigned_route),
      ].filter(Boolean)
    ).size;

    // Calculate utilization percentage (mock data - would come from actual capacity)
    const maxCapacity = 1000; // kg per day
    const utilization = Math.min(
      100,
      Math.round((totalVolume / maxCapacity) * 100)
    );

    return {
      volumeProcessed: `${totalVolume.toFixed(1)}kg`,
      storageUtilization: `${utilization}%`,
      processingEfficiency: `${Math.round((dispatchedItems / Math.max(donations.length, 1)) * 100)}%`,
      activeRoutes,
    };
  }, [donations, requests]);

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
            profiles!donor_id (full_name, organization_name)
          `),
        supabase.from('requests').select(`
            *,
            profiles (full_name, organization_name)
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

      // Transform data for terminal operations display
      const transformedDonations: TerminalDonation[] = donationsData.map(
        (d: any) => ({
          id: d.id,
          created_at: d.created_at,
          organization_name:
            d.profiles?.organization_name ||
            d.profiles?.full_name ||
            'Unknown Donor',
          food_items: d.food_items
            ? [
                {
                  name: d.food_items.name,
                  quantity: parseFloat(d.quantity) || 0,
                  unit: d.unit || 'kg',
                },
              ]
            : [],
          total_weight: parseFloat(d.quantity) || 0,
          status: d.status,
          processing_status:
            d.status === 'picked_up'
              ? 'dispatched'
              : d.status === 'claimed'
                ? 'processing'
                : 'received',
          pickup_time: d.pickup_slots?.[0]?.start_time || 'TBD',
          pickup_date: d.pickup_slots?.[0]?.date || 'TBD',
          location: d.address || 'Terminal Central',
          route_id: `RT${Math.floor(Math.random() * 999)
            .toString()
            .padStart(3, '0')}`,
        })
      );

      const transformedRequests: TerminalRequest[] = requestsData.map(
        (r: any) => ({
          id: r.id,
          created_at: r.created_at,
          organization_name:
            r.profiles?.organization_name ||
            r.profiles?.full_name ||
            'Unknown Receiver',
          description: r.description,
          people_count: r.people_count,
          status: r.status,
          urgency: r.priority || 'medium',
          location: r.address || 'Central Helsinki',
          delivery_window:
            r.pickup_start_time && r.pickup_end_time
              ? `${r.pickup_start_time}-${r.pickup_end_time}`
              : 'TBD',
          is_recurring: r.is_recurring || false,
        })
      );

      setDonations(transformedDonations);
      setRequests(transformedRequests);
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

  // Filter functions
  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const matchesSearch =
        searchTerm === '' ||
        d.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.food_items.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus =
        statusFilter === 'all' || d.processing_status === statusFilter;

      // Date filtering
      const donationDate = new Date(d.created_at);
      const matchesStartDate = !startDate || donationDate >= startDate;
      const matchesEndDate = !endDate || donationDate <= endDate;

      return (
        matchesSearch && matchesStatus && matchesStartDate && matchesEndDate
      );
    });
  }, [donations, searchTerm, statusFilter, startDate, endDate]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        searchTerm === '' ||
        r.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

      // Date filtering
      const requestDate = new Date(r.created_at);
      const matchesStartDate = !startDate || requestDate >= startDate;
      const matchesEndDate = !endDate || requestDate <= endDate;

      return (
        matchesSearch && matchesStatus && matchesStartDate && matchesEndDate
      );
    });
  }, [requests, searchTerm, statusFilter, startDate, endDate]);

  // PDF Export function (lightweight)
  const handlePrintExport = useCallback(() => {
    window.print();
  }, []);

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      {/* Operations Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Operations Overview
            </h2>
            <p className="text-gray-600">
              Current status and real-time metrics
            </p>
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
                    Volume Processed
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
                    Storage Utilization
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
                    Processing Efficiency
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
                    Active Routes
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

      {/* Filters */}
      <section className="px-6 pb-6">
        <div className="max-w-7xl mx-auto bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search organizations, food items, descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

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

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button variant="outline" onClick={handlePrintExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <section className="px-6 pb-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Incoming Donations */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                Incoming Donations ({filteredDonations.length})
              </h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2 p-4">
                {filteredDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedDonation(donation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {donation.organization_name}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              donation.processing_status === 'dispatched'
                                ? 'bg-green-100 text-green-800'
                                : donation.processing_status === 'processing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {donation.processing_status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {donation.food_items.length} items •{' '}
                          {donation.total_weight}kg • Route: {donation.route_id}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            {new Date(donation.created_at).toLocaleDateString()}
                          </span>
                          <span>{donation.location}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredDonations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No donations match your filters
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Outgoing Requests */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-orange-600" />
                Delivery Requests ({filteredRequests.length})
              </h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2 p-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {request.organization_name}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.urgency === 'high'
                                ? 'bg-red-100 text-red-800'
                                : request.urgency === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {request.urgency}
                          </span>
                          {request.is_recurring && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Recurring
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {request.people_count} people •{' '}
                          {request.delivery_window}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                          <span>{request.location}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No requests match your filters
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Detail Modal */}
      <Dialog
        open={!!selectedDonation}
        onOpenChange={() => setSelectedDonation(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Donation Processing Details</DialogTitle>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-4 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Organization
                  </label>
                  <p className="text-gray-900">
                    {selectedDonation.organization_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Processing Status
                  </label>
                  <p className="text-gray-900 capitalize">
                    {selectedDonation.processing_status}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Food Items
                </label>
                <div className="mt-2 space-y-2">
                  {selectedDonation.food_items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span>{item.name}</span>
                      <span className="text-sm text-gray-600">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Route ID
                  </label>
                  <p className="text-gray-900">{selectedDonation.route_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Location
                  </label>
                  <p className="text-gray-900">{selectedDonation.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Pickup Date
                  </label>
                  <p className="text-gray-900">
                    {selectedDonation.pickup_date}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Pickup Time
                  </label>
                  <p className="text-gray-900">
                    {selectedDonation.pickup_time}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Request Detail Modal */}
      <Dialog
        open={!!selectedRequest}
        onOpenChange={() => setSelectedRequest(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Delivery Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 pb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Organization
                  </label>
                  <p className="text-gray-900">
                    {selectedRequest.organization_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <p className="text-gray-900 capitalize">
                    {selectedRequest.status}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Description
                </label>
                <p className="text-gray-900">{selectedRequest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    People Count
                  </label>
                  <p className="text-gray-900">
                    {selectedRequest.people_count} people
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Urgency
                  </label>
                  <p
                    className={`capitalize font-medium ${
                      selectedRequest.urgency === 'high'
                        ? 'text-red-600'
                        : selectedRequest.urgency === 'medium'
                          ? 'text-yellow-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {selectedRequest.urgency}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Location
                  </label>
                  <p className="text-gray-900">{selectedRequest.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Delivery Window
                  </label>
                  <p className="text-gray-900">
                    {selectedRequest.delivery_window}
                  </p>
                </div>
              </div>

              {selectedRequest.assigned_route && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Assigned Route
                  </label>
                  <p className="text-gray-900">
                    {selectedRequest.assigned_route}
                  </p>
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
