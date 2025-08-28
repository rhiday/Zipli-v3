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
  Package,
  Truck,
  Users,
  Activity,
  TrendingUp,
  CheckCircle,
  Plus,
  FileText,
  Calendar,
  MapPin,
  Clock,
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

// Language content
const content = {
  fi: {
    title: 'Stadin Safka Terminal',
    subtitle: 'Reaaliaikainen ruoan jakelun hallintajärjestelmä',
    exportReport: 'Vie raportti',
    today: 'Tänään',
    thisWeek: 'Tämä viikko',
    thisMonth: 'Tämä kuukausi',
    totalDonations: 'Lahjoitukset yhteensä',
    activeRequests: 'Aktiiviset pyynnöt',
    storageCapacity: 'Varastokapasiteetti',
    dailyVolume: 'Päivän volyymi',
    monthlyTrends: 'Kuukausittaiset trendit',
    storageByCategory: 'Varasto kategorioittain',
    topRecipients: 'Suurimmat vastaanottajat',
    recentActivity: 'Viimeaikainen toiminta',
    todaysSchedule: 'Päivän aikataulu',
    logistics: 'Logistiikka ja kuljetukset',
    quickActions: 'Pikatoiminnot',
    systemStatus: 'Järjestelmän tila',
    live: 'Live',
    currentKg: 'Nykyinen (kg)',
    capacityKg: 'Kapasiteetti (kg)',
    donations: 'Lahjoitukset',
    requests: 'Pyynnöt',
    operations: 'Toiminnot',
    allSystemsRunning: 'Kaikki järjestelmät toimivat',
    processingTime: 'Käsittelyaika',
    average: 'Keskiarvo',
    fulfillmentRate: 'Täyttöaste',
    current: 'Nykyinen',
    online: 'Online',
    normal: 'Normaali',
    excellent: 'Erinomainen',
    fromYesterday: 'eilisestä',
    newDonation: 'Uusi lahjoitus',
    schedulePickup: 'Ajoita nouto',
    manageInventory: 'Hallitse varastoa',
    generateReport: 'Luo raportti',
    minAgo: 'min sitten',
    processing: 'käsittelyssä',
    pending: 'odottaa',
    completed: 'valmis',
    fulfilled: 'täytetty',
    driver: 'Kuljettaja',
    vehicle: 'Ajoneuvo',
    pickup: 'Nouto',
    delivery: 'Toimitus',
    containers: 'GN-astiat',
    schedule: 'Aikataulu',
    route: 'Reitti',
    available: 'Vapaa',
    onRoute: 'Reitillä',
    returning: 'Palaamassa',
    january: 'Tammikuu',
    february: 'Helmikuu',
    march: 'Maaliskuu',
    april: 'Huhtikuu',
    may: 'Toukokuu',
    june: 'Kesäkuu',
    july: 'Heinäkuu',
    august: 'Elokuu',
    september: 'Syyskuu',
    october: 'Lokakuu',
    november: 'Marraskuu',
    december: 'Joulukuu',
  },
  en: {
    title: 'Stadin Safka Terminal',
    subtitle: 'Real-time Food Distribution Management System',
    exportReport: 'Export Report',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    totalDonations: 'Total Donations',
    activeRequests: 'Active Requests',
    storageCapacity: 'Storage Capacity',
    dailyVolume: 'Daily Volume',
    monthlyTrends: 'Monthly Trends',
    storageByCategory: 'Storage by Category',
    topRecipients: 'Top Recipients',
    recentActivity: 'Recent Activity',
    todaysSchedule: "Today's Schedule",
    logistics: 'Logistics & Transportation',
    quickActions: 'Quick Actions',
    systemStatus: 'System Status',
    live: 'Live',
    currentKg: 'Current (kg)',
    capacityKg: 'Capacity (kg)',
    donations: 'Donations',
    requests: 'Requests',
    operations: 'Operations',
    allSystemsRunning: 'All systems running',
    processingTime: 'Processing Time',
    average: 'Average',
    fulfillmentRate: 'Fulfillment Rate',
    current: 'Current',
    online: 'Online',
    normal: 'Normal',
    excellent: 'Excellent',
    fromYesterday: 'from yesterday',
    newDonation: 'New Donation',
    schedulePickup: 'Schedule Pickup',
    manageInventory: 'Manage Inventory',
    generateReport: 'Generate Report',
    minAgo: 'min ago',
    processing: 'processing',
    pending: 'pending',
    completed: 'completed',
    fulfilled: 'fulfilled',
    driver: 'Driver',
    vehicle: 'Vehicle',
    pickup: 'Pickup',
    delivery: 'Delivery',
    containers: 'GN Containers',
    schedule: 'Schedule',
    route: 'Route',
    available: 'Available',
    onRoute: 'On Route',
    returning: 'Returning',
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
  },
};

// Fleet data with drivers and vehicles
const fleetData = [
  {
    id: 1,
    driver: 'Matti Virtanen',
    vehicle: 'Ford Transit 1',
    plateNumber: 'ABC-123',
    status: 'onRoute',
    currentLocation: 'K-Citymarket Kallio',
    containers: 8,
    maxContainers: 12,
  },
  {
    id: 2,
    driver: 'Jari Korhonen',
    vehicle: 'Mercedes Sprinter',
    plateNumber: 'XYZ-456',
    status: 'available',
    currentLocation: 'Terminal',
    containers: 0,
    maxContainers: 15,
  },
  {
    id: 3,
    driver: 'Sanna Nieminen',
    vehicle: 'Ford Transit 2',
    plateNumber: 'DEF-789',
    status: 'returning',
    currentLocation: 'Pelastusarmeija',
    containers: 4,
    maxContainers: 12,
  },
];

// Today's schedule data
const getTodaysSchedule = (lang: 'fi' | 'en') => [
  {
    time: '08:00',
    type: 'pickup',
    location: 'Sodexo Vilppulantie',
    driver: 'Matti Virtanen',
    containers: 6,
    status: 'completed',
    address: 'Vilppulantie 4',
  },
  {
    time: '09:30',
    type: 'delivery',
    location: 'Tsänssi',
    driver: 'Matti Virtanen',
    containers: 4,
    status: 'completed',
    address: 'Hämeentie 135',
  },
  {
    time: '10:00',
    type: 'pickup',
    location: 'K-Citymarket Kallio',
    driver: 'Sanna Nieminen',
    containers: 8,
    status: 'onRoute',
    address: 'Hämeentie 135',
  },
  {
    time: '11:30',
    type: 'delivery',
    location:
      lang === 'fi'
        ? 'Helsingin Diakonissalaitos'
        : 'Helsinki Deaconess Institute',
    driver: 'Sanna Nieminen',
    containers: 5,
    status: 'pending',
    address: 'Ratakatu 12',
  },
  {
    time: '13:00',
    type: 'pickup',
    location: 'S-Market Kamppi',
    driver: 'Jari Korhonen',
    containers: 7,
    status: 'pending',
    address: 'Urho Kekkosen katu 1',
  },
  {
    time: '14:30',
    type: 'delivery',
    location: 'Pelastusarmeija',
    driver: 'Jari Korhonen',
    containers: 6,
    status: 'pending',
    address: 'Albertinkatu 23',
  },
  {
    time: '15:30',
    type: 'pickup',
    location: 'Fazer Bakery Punavuori',
    driver: 'Matti Virtanen',
    containers: 3,
    status: 'pending',
    address: 'Iso Roobertinkatu 21',
  },
  {
    time: '16:30',
    type: 'delivery',
    location: 'Caritas Helsinki',
    driver: 'Matti Virtanen',
    containers: 4,
    status: 'pending',
    address: 'Pyhän Henrikin aukio 1',
  },
];

// Monthly trends data (last 6 months)
const getMonthlyTrends = (lang: 'fi' | 'en') => {
  const months =
    lang === 'fi'
      ? ['Maalis', 'Huhti', 'Touko', 'Kesä', 'Heinä', 'Elo']
      : ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

  return [
    { month: months[0], donations: 85420, requests: 78350 },
    { month: months[1], donations: 92180, requests: 86420 },
    { month: months[2], donations: 98560, requests: 91230 },
    { month: months[3], donations: 103420, requests: 96850 },
    { month: months[4], donations: 108690, requests: 102340 },
    { month: months[5], donations: 112850, requests: 106720 },
  ];
};

// Real organizations for pie chart
const getTopRecipientsData = (lang: 'fi' | 'en') => [
  {
    name: 'Tsänssi',
    value: 2850,
    percentage: 28,
    color: '#4CAF50',
  },
  {
    name: lang === 'fi' ? 'Helsingin Diakonissalaitos' : 'Helsinki Deaconess',
    value: 2340,
    percentage: 23,
    color: '#2196F3',
  },
  {
    name: 'Pelastusarmeija',
    value: 1890,
    percentage: 19,
    color: '#FF9800',
  },
  {
    name: 'Caritas Helsinki',
    value: 1530,
    percentage: 15,
    color: '#9C27B0',
  },
  {
    name: lang === 'fi' ? 'Muut' : 'Others',
    value: 1520,
    percentage: 15,
    color: '#607D8B',
  },
];

// Storage data with Finnish categories
const getStorageData = (lang: 'fi' | 'en') => [
  {
    category: lang === 'fi' ? 'Vihannekset' : 'Vegetables',
    amount: 850,
    capacity: 1200,
  },
  {
    category: lang === 'fi' ? 'Maitotuotteet' : 'Dairy',
    amount: 420,
    capacity: 600,
  },
  {
    category: lang === 'fi' ? 'Leipä' : 'Bread',
    amount: 320,
    capacity: 400,
  },
  {
    category: lang === 'fi' ? 'Hedelmät' : 'Fruits',
    amount: 680,
    capacity: 800,
  },
  {
    category: lang === 'fi' ? 'Valmisruoka' : 'Prepared',
    amount: 290,
    capacity: 500,
  },
];

// Recent activities with real Helsinki organizations
const getRecentActivities = (lang: 'fi' | 'en') => [
  {
    id: 1,
    type: 'donation',
    organization: 'K-Citymarket Kallio',
    amount: '120kg',
    category: lang === 'fi' ? 'Sekalaisia elintarvikkeita' : 'Mixed groceries',
    time: lang === 'fi' ? '2 min sitten' : '2 min ago',
    status: 'processing',
  },
  {
    id: 2,
    type: 'request',
    organization:
      lang === 'fi' ? 'Helsingin Ruokapankki' : 'Helsinki Food Bank',
    amount: '80kg',
    category:
      lang === 'fi' ? 'Vihanneksia & Maitotuotteita' : 'Vegetables & Dairy',
    time: lang === 'fi' ? '5 min sitten' : '5 min ago',
    status: 'fulfilled',
  },
  {
    id: 3,
    type: 'donation',
    organization: 'S-Market Kamppi',
    amount: '65kg',
    category: lang === 'fi' ? 'Leipomotuotteita' : 'Bakery products',
    time: lang === 'fi' ? '12 min sitten' : '12 min ago',
    status: 'processing',
  },
];

export default function CityDashboardPage(): React.ReactElement {
  const [timeRange, setTimeRange] = useState('Today');
  const [language, setLanguage] = useState<'fi' | 'en'>('en');
  const t = content[language];

  // Realistic metrics based on Helsinki operations
  const metrics = {
    totalDonations: 3428,
    donationsChange: '+12%',
    totalRequests: 2856,
    requestsChange: '+8%',
    storageCapacity: 72,
    dailyVolume: 4250,
    volumeChange: '+5%',
    processingTime: '18 sec',
    fulfillmentRate: 96.8,
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: { fi: string; en: string } } = {
      processing: { fi: 'käsittelyssä', en: 'processing' },
      pending: { fi: 'odottaa', en: 'pending' },
      completed: { fi: 'valmis', en: 'completed' },
      fulfilled: { fi: 'täytetty', en: 'fulfilled' },
      onRoute: { fi: 'reitillä', en: 'on route' },
      available: { fi: 'vapaa', en: 'available' },
      returning: { fi: 'palaamassa', en: 'returning' },
    };
    return statusMap[status]?.[language] || status;
  };

  const getTypeIcon = (type: string) => {
    return type === 'pickup' ? (
      <ArrowUpIcon className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 text-green-600" />
    );
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      completed: 'bg-green-100 text-green-800',
      onRoute: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800',
      available: 'bg-green-100 text-green-800',
      returning: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
              <p className="mt-1 text-sm text-gray-500">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('fi')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    language === 'fi'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  FI
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    language === 'en'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  EN
                </button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    {timeRange === 'Today'
                      ? t.today
                      : timeRange === 'This Week'
                        ? t.thisWeek
                        : t.thisMonth}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setTimeRange('Today')}>
                    {t.today}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setTimeRange('This Week')}>
                    {t.thisWeek}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setTimeRange('This Month')}>
                    {t.thisMonth}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button className="bg-green-600 hover:bg-green-700">
                {t.exportReport}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Logistics & Today's Schedule - Moved to top */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Fleet Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {t.logistics}
            </h2>
            <div className="space-y-3">
              {fleetData.map((vehicle) => (
                <div key={vehicle.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{vehicle.driver}</p>
                      <p className="text-xs text-gray-500">
                        {vehicle.vehicle} • {vehicle.plateNumber}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}
                    >
                      {getStatusText(vehicle.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{vehicle.currentLocation}</span>
                    <span>
                      {vehicle.containers}/{vehicle.maxContainers}{' '}
                      {t.containers}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{
                        width: `${(vehicle.containers / vehicle.maxContainers) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t.todaysSchedule}
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getTodaysSchedule(language).map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    item.status === 'completed'
                      ? 'bg-gray-50'
                      : item.status === 'onRoute'
                        ? 'bg-blue-50 border-blue-200'
                        : ''
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-medium">{item.time}</span>
                    <div
                      className={`mt-1 p-1 rounded-full ${
                        item.type === 'pickup' ? 'bg-blue-100' : 'bg-green-100'
                      }`}
                    >
                      {getTypeIcon(item.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{item.location}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">{item.driver}</p>
                        <p className="text-sm font-medium">
                          {item.containers} GN
                        </p>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                  >
                    {getStatusText(item.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t.totalDonations}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {metrics.totalDonations.toLocaleString()}
                </p>
                <p className="mt-2 flex items-center text-sm text-green-600">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  {metrics.donationsChange} {t.fromYesterday}
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
                  {t.activeRequests}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {metrics.totalRequests.toLocaleString()}
                </p>
                <p className="mt-2 flex items-center text-sm text-blue-600">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  {metrics.requestsChange} {t.fromYesterday}
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
                  {t.storageCapacity}
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
                  {t.dailyVolume}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {metrics.dailyVolume}kg
                </p>
                <p className="mt-2 flex items-center text-sm text-green-600">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  {metrics.volumeChange}{' '}
                  {language === 'fi' ? 'tänään' : 'today'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t.monthlyTrends}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getMonthlyTrends(language)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="donations"
                  stackId="1"
                  stroke="#4CAF50"
                  fill="#4CAF50"
                  fillOpacity={0.6}
                  name={`${t.donations} (kg)`}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stackId="1"
                  stroke="#2196F3"
                  fill="#2196F3"
                  fillOpacity={0.6}
                  name={`${t.requests} (kg)`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Storage Capacity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t.storageByCategory}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getStorageData(language)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#4CAF50" name={t.currentKg} />
                <Bar dataKey="capacity" fill="#e5e7eb" name={t.capacityKg} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Recipients and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Recipients with real names */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t.topRecipients}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getTopRecipientsData(language)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getTopRecipientsData(language).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {getTopRecipientsData(language).map((recipient, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: recipient.color }}
                    />
                    <span>{recipient.name}</span>
                  </div>
                  <span className="font-medium">{recipient.value}kg</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {t.recentActivity}
              </h2>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 mr-1 bg-green-400 rounded-full animate-pulse"></span>
                {t.live}
              </span>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {getRecentActivities(language).map((activity) => (
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
                        <ArrowDownIcon className="h-5 w-5 text-green-600" />
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
                      {getStatusText(activity.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t.quickActions}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              {t.newDonation}
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2">
              <Truck className="h-4 w-4" />
              {t.schedulePickup}
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2">
              <Package className="h-4 w-4" />
              {t.manageInventory}
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2">
              <FileText className="h-4 w-4" />
              {t.generateReport}
            </Button>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t.systemStatus}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">{t.operations}</p>
                  <p className="text-sm text-gray-500">{t.allSystemsRunning}</p>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">
                {t.online}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {t.processingTime}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t.average}: {metrics.processingTime}
                  </p>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">
                {t.normal}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {t.fulfillmentRate}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t.current}: {metrics.fulfillmentRate}%
                  </p>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">
                {t.excellent}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
