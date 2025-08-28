'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Building2,
  ChevronDown,
  Clock,
  Package,
  Truck,
  Users,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';

// Mock data for the terminal dashboard
const hourlyActivity = [
  { hour: '06:00', donations: 12, requests: 8 },
  { hour: '07:00', donations: 18, requests: 15 },
  { hour: '08:00', donations: 35, requests: 22 },
  { hour: '09:00', donations: 42, requests: 38 },
  { hour: '10:00', donations: 58, requests: 45 },
  { hour: '11:00', donations: 65, requests: 52 },
  { hour: '12:00', donations: 48, requests: 55 },
  { hour: '13:00', donations: 52, requests: 48 },
  { hour: '14:00', donations: 45, requests: 42 },
  { hour: '15:00', donations: 38, requests: 35 },
  { hour: '16:00', donations: 32, requests: 28 },
  { hour: '17:00', donations: 25, requests: 22 },
];

const storageData = [
  { category: 'Vegetables', amount: 850, capacity: 1200 },
  { category: 'Dairy', amount: 420, capacity: 600 },
  { category: 'Bread', amount: 320, capacity: 400 },
  { category: 'Fruits', amount: 680, capacity: 800 },
  { category: 'Prepared', amount: 280, capacity: 500 },
];

const distributionData = [
  { name: 'NGOs', value: 35, color: '#10b981' },
  { name: 'Schools', value: 25, color: '#3b82f6' },
  { name: 'Shelters', value: 20, color: '#f59e0b' },
  { name: 'Community Centers', value: 15, color: '#8b5cf6' },
  { name: 'Direct Pickup', value: 5, color: '#ef4444' },
];

const recentActivities = [
  {
    id: 1,
    type: 'donation',
    organization: 'K-Citymarket Kallio',
    amount: '120kg',
    category: 'Mixed groceries',
    time: '2 min ago',
    status: 'processing',
  },
  {
    id: 2,
    type: 'request',
    organization: 'Helsinki Food Bank',
    amount: '80kg',
    category: 'Vegetables & Dairy',
    time: '5 min ago',
    status: 'fulfilled',
  },
  {
    id: 3,
    type: 'donation',
    organization: 'S-Market Kamppi',
    amount: '65kg',
    category: 'Bakery products',
    time: '12 min ago',
    status: 'processing',
  },
  {
    id: 4,
    type: 'request',
    organization: 'Pelastusarmeija',
    amount: '150kg',
    category: 'Any category',
    time: '18 min ago',
    status: 'pending',
  },
  {
    id: 5,
    type: 'donation',
    organization: 'Alepa Punavuori',
    amount: '45kg',
    category: 'Fruits',
    time: '25 min ago',
    status: 'completed',
  },
];

const weeklyTrends = [
  { day: 'Mon', donations: 420, requests: 380, waste_saved: 40 },
  { day: 'Tue', donations: 480, requests: 420, waste_saved: 60 },
  { day: 'Wed', donations: 520, requests: 490, waste_saved: 30 },
  { day: 'Thu', donations: 580, requests: 550, waste_saved: 30 },
  { day: 'Fri', donations: 650, requests: 580, waste_saved: 70 },
  { day: 'Sat', donations: 380, requests: 350, waste_saved: 30 },
  { day: 'Sun', donations: 280, requests: 260, waste_saved: 20 },
];

export default function CityDashboardPage(): React.ReactElement {
  const [timeRange, setTimeRange] = useState('Today');
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate real-time metrics
  const metrics = {
    totalDonations: 3428,
    totalRequests: 2856,
    storageCapacity: 72,
    dailyThroughput: 4250,
    activePartners: 68,
    pendingRequests: 12,
    processingTime: '18 min',
    fulfillmentRate: 94.5,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Stadin Safka Terminal
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Real-time Food Distribution Management System
              </p>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    {timeRange}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setTimeRange('Today')}>
                    Today
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setTimeRange('This Week')}>
                    This Week
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setTimeRange('This Month')}>
                    This Month
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="bg-green-600 hover:bg-green-700">
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Donations
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {metrics.totalDonations.toLocaleString()}
                </p>
                <p className="mt-2 flex items-center text-sm text-green-600">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  12% from yesterday
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Requests
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {metrics.totalRequests.toLocaleString()}
                </p>
                <p className="mt-2 flex items-center text-sm text-blue-600">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  8% from yesterday
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Storage Capacity
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {metrics.storageCapacity}%
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${metrics.storageCapacity}%` }}
                  />
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Building2 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Daily Throughput
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {metrics.dailyThroughput}kg
                </p>
                <p className="mt-2 flex items-center text-sm text-green-600">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  On track
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Activity Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Hourly Activity
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="donations"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Storage Capacity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Storage by Category
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#10b981" name="Current (kg)" />
                <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Distribution by Recipient
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 mr-1 bg-green-400 rounded-full animate-pulse"></span>
                Live
              </span>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === 'donation'
                          ? 'bg-green-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      {activity.type === 'donation' ? (
                        <ArrowDownIcon
                          className={`h-5 w-5 ${
                            activity.type === 'donation'
                              ? 'text-green-600'
                              : 'text-blue-600'
                          }`}
                        />
                      ) : (
                        <ArrowUpIcon className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {activity.organization}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.amount} • {activity.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        activity.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : activity.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : activity.status === 'fulfilled'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Trends */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Performance Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="donations"
                stroke="#10b981"
                strokeWidth={2}
                name="Donations (kg)"
              />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Requests (kg)"
              />
              <Line
                type="monotone"
                dataKey="waste_saved"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Waste Saved (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Process New Donation
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Match Request
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Schedule Pickup
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              Generate Report
            </Button>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Operations</p>
                  <p className="text-sm text-gray-500">All systems running</p>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Processing Time</p>
                  <p className="text-sm text-gray-500">
                    Average: {metrics.processingTime}
                  </p>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">Normal</span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Fulfillment Rate</p>
                  <p className="text-sm text-gray-500">
                    Current: {metrics.fulfillmentRate}%
                  </p>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">
                Excellent
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
