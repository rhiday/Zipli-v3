'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDatabase } from '@/store';
import { useCommonTranslation } from '@/lib/i18n-enhanced';
import {
  Building2,
  Download,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  Leaf,
  FileText,
  Eye,
  ChevronDown,
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
  DialogTrigger,
} from '@/components/ui/dialog';

// Types for dashboard data
type DashboardDonation = {
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
  pickup_time: string;
  pickup_date: string;
  donor_contact: string;
};

type DashboardRequest = {
  id: string;
  created_at: string;
  organization_name: string;
  description: string;
  people_count: number;
  status: 'active' | 'fulfilled' | 'cancelled';
  urgency: 'low' | 'medium' | 'high';
  contact_info: string;
  allergens?: string[];
};

export default function CityDashboard() {
  const router = useRouter();
  const { currentUser, isInitialized, getAllDonations, getAllRequests } =
    useDatabase();
  const { t } = useCommonTranslation();

  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<DashboardDonation[]>([]);
  const [requests, setRequests] = useState<DashboardRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [selectedDonation, setSelectedDonation] =
    useState<DashboardDonation | null>(null);
  const [selectedRequest, setSelectedRequest] =
    useState<DashboardRequest | null>(null);

  // Analytics data
  const analytics = useMemo(() => {
    const totalWeight = donations.reduce((sum, d) => sum + d.total_weight, 0);
    const activeOrganizations = new Set([
      ...donations.map((d) => d.organization_name),
      ...requests.map((r) => r.organization_name),
    ]).size;
    const wasteReduction = Math.round((totalWeight / 1000) * 2.3 * 100) / 100; // Estimate
    const co2Saved = Math.round(totalWeight * 2.1) / 1000; // tons

    return {
      totalWeight: `${totalWeight.toFixed(1)}kg`,
      activeOrganizations,
      wasteReduction: `${wasteReduction}%`,
      co2Saved: `${co2Saved.toFixed(1)}t`,
    };
  }, [donations, requests]);

  // Load data with network optimization
  const loadData = useCallback(async () => {
    if (!isInitialized || !currentUser) return;

    setLoading(true);
    try {
      // Get data with simple optimization
      const [donationsData, requestsData] = await Promise.all([
        getAllDonations(),
        getAllRequests(),
      ]);

      // Transform data for dashboard display
      const transformedDonations: DashboardDonation[] = donationsData.map(
        (d: any) => ({
          id: d.id,
          created_at: d.created_at,
          organization_name:
            d.donor?.organization_name || d.donor?.full_name || 'Unknown',
          food_items: d.food_items || [],
          total_weight:
            d.food_items?.reduce(
              (sum: number, item: any) => sum + (item.quantity || 0),
              0
            ) || 0,
          status: d.status,
          pickup_time: d.pickup_slots?.[0]?.start_time || 'TBD',
          pickup_date: d.pickup_slots?.[0]?.date || 'TBD',
          donor_contact:
            d.donor?.contact_number || d.donor?.email || 'Not provided',
        })
      );

      const transformedRequests: DashboardRequest[] = requestsData.map(
        (r: any) => ({
          id: r.id,
          created_at: r.created_at,
          organization_name:
            r.requester?.organization_name ||
            r.requester?.full_name ||
            'Unknown',
          description: r.description,
          people_count: r.people_count,
          status: r.status,
          urgency: r.priority || 'medium',
          contact_info:
            r.requester?.contact_number || r.requester?.email || 'Not provided',
          allergens: r.allergens,
        })
      );

      setDonations(transformedDonations);
      setRequests(transformedRequests);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [isInitialized, currentUser, getAllDonations, getAllRequests]);

  // Auto-refresh every 30 seconds
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
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchesOrg =
        orgFilter === 'all' || d.organization_name === orgFilter;
      return matchesSearch && matchesStatus && matchesOrg;
    });
  }, [donations, searchTerm, statusFilter, orgFilter]);

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        searchTerm === '' ||
        r.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesOrg =
        orgFilter === 'all' || r.organization_name === orgFilter;
      return matchesSearch && matchesStatus && matchesOrg;
    });
  }, [requests, searchTerm, statusFilter, orgFilter]);

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

  if (!currentUser || currentUser.role !== 'city') {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Helsinki Food Network Dashboard
            </h1>
            <p className="text-gray-600">
              City-wide food redistribution monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handlePrintExport}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
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
      </header>

      {/* Analytics Cards */}
      <section className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Food Redistributed
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {analytics.totalWeight}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Partners
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {analytics.activeOrganizations}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Waste Reduction
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {analytics.wasteReduction}
                  </p>
                </div>
                <Leaf className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CO2 Saved</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {analytics.co2Saved}
                  </p>
                </div>
                <Leaf className="w-8 h-8 text-emerald-600" />
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
                  placeholder="Search organizations, food items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={orgFilter} onValueChange={setOrgFilter}>
              <SelectTrigger className="w-48">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {Array.from(
                  new Set([
                    ...donations.map((d) => d.organization_name),
                    ...requests.map((r) => r.organization_name),
                  ])
                ).map((org) => (
                  <SelectItem key={org} value={org}>
                    {org}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <section className="px-6 pb-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donations Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Donations ({filteredDonations.length})
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
                              donation.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : donation.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {donation.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {donation.food_items.length} items •{' '}
                          {donation.total_weight}kg
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            {new Date(donation.created_at).toLocaleDateString()}
                          </span>
                          <span>Pickup: {donation.pickup_time}</span>
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

          {/* Requests Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Requests ({filteredRequests.length})
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
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {request.people_count} people • {request.status}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                          <span>{request.description.substring(0, 40)}...</span>
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
            <DialogTitle>Donation Details</DialogTitle>
          </DialogHeader>
          {selectedDonation && (
            <div className="space-y-4">
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
                    Status
                  </label>
                  <p className="text-gray-900 capitalize">
                    {selectedDonation.status}
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

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Contact Information
                </label>
                <p className="text-gray-900">
                  {selectedDonation.donor_contact}
                </p>
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
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
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

              {selectedRequest.allergens &&
                selectedRequest.allergens.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Dietary Restrictions
                    </label>
                    <p className="text-gray-900">
                      {selectedRequest.allergens.join(', ')}
                    </p>
                  </div>
                )}

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Contact Information
                </label>
                <p className="text-gray-900">{selectedRequest.contact_info}</p>
              </div>
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
    </div>
  );
}
