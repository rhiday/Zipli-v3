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
    dailyThroughput: 'Päivittäinen läpimeno',
    hourlyActivity: 'Tuntikohtainen toiminta',
    storageByCategory: 'Varasto kategorioittain',
    distributionByRecipient: 'Jakelu vastaanottajittain',
    recentActivity: 'Viimeaikainen toiminta',
    weeklyPerformance: 'Viikkosuoritus',
    quickActions: 'Pikatoiminnot',
    systemStatus: 'Järjestelmän tila',
    live: 'Live',
    currentKg: 'Nykyinen (kg)',
    capacityKg: 'Kapasiteetti (kg)',
    donations: 'Lahjoitukset',
    requests: 'Pyynnöt',
    wasteReduced: 'Jätteen vähennys (kg)',
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
    dailyThroughput: 'Daily Throughput',
    hourlyActivity: 'Hourly Activity',
    storageByCategory: 'Storage by Category',
    distributionByRecipient: 'Distribution by Recipient',
    recentActivity: 'Recent Activity',
    weeklyPerformance: 'Weekly Performance Overview',
    quickActions: 'Quick Actions',
    systemStatus: 'System Status',
    live: 'Live',
    currentKg: 'Current (kg)',
    capacityKg: 'Capacity (kg)',
    donations: 'Donations',
    requests: 'Requests',
    wasteReduced: 'Waste Reduced (kg)',
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
  },
};

// Realistic Helsinki organizations data
const majorDonors = [
  {
    name: 'Sodexo Vilppulantie',
    address: 'Vilppulantie 4, 00410 Helsinki',
    type: 'Corporate Catering',
    weeklyAverage: '180kg',
  },
  {
    name: 'Sodexo Helsinki Airport',
    address: 'Helsinki-Vantaa Airport, Terminal 2',
    type: 'Airport Catering',
    weeklyAverage: '220kg',
  },
  {
    name: 'Stockmann Herkku',
    address: 'Aleksanterinkatu 52, 00100 Helsinki',
    type: 'Department Store Food',
    weeklyAverage: '150kg',
  },
  {
    name: 'S-Market Kamppi',
    address: 'Urho Kekkosen katu 1, 00100 Helsinki',
    type: 'Supermarket',
    weeklyAverage: '200kg',
  },
  {
    name: 'K-Citymarket Kallio',
    address: 'Hämeentie 135, 00560 Helsinki',
    type: 'Hypermarket',
    weeklyAverage: '280kg',
  },
  {
    name: 'Fazer Bakery Punavuori',
    address: 'Iso Roobertinkatu 21, 00120 Helsinki',
    type: 'Bakery',
    weeklyAverage: '90kg',
  },
];

const majorRecipients = [
  {
    name: 'Tsänssi',
    nameEn: 'Tsänssi Community Kitchen',
    address: 'Hämeentie 135, 00560 Helsinki',
    servesDaily: '150',
  },
  {
    name: 'Helsingin Diakonissalaitos',
    nameEn: 'Helsinki Deaconess Institute',
    address: 'Ratakatu 12, 00120 Helsinki',
    servesDaily: '200',
  },
  {
    name: 'Pelastusarmeija',
    nameEn: 'Salvation Army Helsinki',
    address: 'Albertinkatu 23, 00180 Helsinki',
    servesDaily: '180',
  },
  {
    name: 'Caritas Helsinki',
    nameEn: 'Caritas Helsinki',
    address: 'Pyhän Henrikin aukio 1, 00140 Helsinki',
    servesDaily: '120',
  },
];

// Hourly activity with realistic patterns
const hourlyActivity = [
  { hour: '06:00', donations: 45, requests: 32 },
  { hour: '07:00', donations: 78, requests: 45 },
  { hour: '08:00', donations: 120, requests: 89 },
  { hour: '09:00', donations: 156, requests: 134 },
  { hour: '10:00', donations: 189, requests: 167 },
  { hour: '11:00', donations: 234, requests: 198 },
  { hour: '12:00', donations: 267, requests: 223 },
  { hour: '13:00', donations: 298, requests: 245 },
  { hour: '14:00', donations: 312, requests: 267 },
  { hour: '15:00', donations: 289, requests: 234 },
  { hour: '16:00', donations: 245, requests: 198 },
  { hour: '17:00', donations: 178, requests: 145 },
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

// Distribution data with Finnish organizations
const getDistributionData = (lang: 'fi' | 'en') => [
  {
    name: lang === 'fi' ? 'Järjestöt' : 'NGOs',
    value: 55,
    color: '#4CAF50',
  },
  {
    name: lang === 'fi' ? 'Koulut' : 'Schools',
    value: 25,
    color: '#2196F3',
  },
  {
    name: lang === 'fi' ? 'Suora nouto' : 'Direct Pickup',
    value: 12,
    color: '#FF9800',
  },
  {
    name: lang === 'fi' ? 'Yhteisökeskukset' : 'Community Centers',
    value: 8,
    color: '#9C27B0',
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
  {
    id: 4,
    type: 'request',
    organization: 'Pelastusarmeija',
    amount: '150kg',
    category: lang === 'fi' ? 'Mitä tahansa' : 'Any category',
    time: lang === 'fi' ? '18 min sitten' : '18 min ago',
    status: 'pending',
  },
  {
    id: 5,
    type: 'donation',
    organization: 'Alepa Punavuori',
    amount: '45kg',
    category: lang === 'fi' ? 'Hedelmiä' : 'Fruits',
    time: lang === 'fi' ? '25 min sitten' : '25 min ago',
    status: 'completed',
  },
  {
    id: 6,
    type: 'request',
    organization: 'Tsänssi',
    amount: '95kg',
    category: lang === 'fi' ? 'Valmisruokaa' : 'Prepared meals',
    time: lang === 'fi' ? '32 min sitten' : '32 min ago',
    status: 'fulfilled',
  },
  {
    id: 7,
    type: 'donation',
    organization: 'Fazer Bakery Punavuori',
    amount: '38kg',
    category: lang === 'fi' ? 'Leipää' : 'Bread',
    time: lang === 'fi' ? '45 min sitten' : '45 min ago',
    status: 'completed',
  },
];

// Weekly trends with Finnish day names
const getWeeklyTrends = (lang: 'fi' | 'en') => [
  {
    day: lang === 'fi' ? 'Ma' : 'Mon',
    donations: 420,
    requests: 380,
    waste_saved: 245,
  },
  {
    day: lang === 'fi' ? 'Ti' : 'Tue',
    donations: 465,
    requests: 425,
    waste_saved: 278,
  },
  {
    day: lang === 'fi' ? 'Ke' : 'Wed',
    donations: 510,
    requests: 475,
    waste_saved: 312,
  },
  {
    day: lang === 'fi' ? 'To' : 'Thu',
    donations: 580,
    requests: 545,
    waste_saved: 356,
  },
  {
    day: lang === 'fi' ? 'Pe' : 'Fri',
    donations: 625,
    requests: 590,
    waste_saved: 389,
  },
  {
    day: lang === 'fi' ? 'La' : 'Sat',
    donations: 380,
    requests: 345,
    waste_saved: 234,
  },
  {
    day: lang === 'fi' ? 'Su' : 'Sun',
    donations: 290,
    requests: 265,
    waste_saved: 178,
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
    dailyThroughput: 4250,
    throughputChange: '+5%',
    processingTime: '18 sec',
    fulfillmentRate: 96.8,
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: { fi: string; en: string } } = {
      processing: { fi: 'käsittelyssä', en: 'processing' },
      pending: { fi: 'odottaa', en: 'pending' },
      completed: { fi: 'valmis', en: 'completed' },
      fulfilled: { fi: 'täytetty', en: 'fulfilled' },
    };
    return statusMap[status]?.[language] || status;
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
                  {t.dailyThroughput}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {metrics.dailyThroughput}kg
                </p>
                <p className="mt-2 flex items-center text-sm text-green-600">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  {metrics.throughputChange}{' '}
                  {language === 'fi' ? 'tänään' : 'today'}
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
              {t.hourlyActivity}
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
                  stroke="#4CAF50"
                  fill="#4CAF50"
                  fillOpacity={0.6}
                  name={t.donations}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stackId="1"
                  stroke="#2196F3"
                  fill="#2196F3"
                  fillOpacity={0.6}
                  name={t.requests}
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

        {/* Distribution and Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t.distributionByRecipient}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getDistributionData(language)}
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
                  {getDistributionData(language).map((entry, index) => (
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

        {/* Weekly Trends */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t.weeklyPerformance}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getWeeklyTrends(language)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="donations"
                stroke="#4CAF50"
                strokeWidth={2}
                name={`${t.donations} (kg)`}
              />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#2196F3"
                strokeWidth={2}
                name={`${t.requests} (kg)`}
              />
              <Line
                type="monotone"
                dataKey="waste_saved"
                stroke="#FF9800"
                strokeWidth={2}
                name={t.wasteReduced}
              />
            </LineChart>
          </ResponsiveContainer>
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
                <Activity className="h-5 w-5 text-green-600" />
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

        {/* Major Donors & Recipients Info (Hidden but available in data) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'fi' ? 'Suurimmat lahjoittajat' : 'Major Donors'}
            </h2>
            <div className="space-y-3">
              {majorDonors.slice(0, 5).map((donor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{donor.name}</p>
                    <p className="text-xs text-gray-500">{donor.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      {donor.weeklyAverage}
                    </p>
                    <p className="text-xs text-gray-500">
                      {language === 'fi' ? 'viikossa' : 'weekly'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'fi'
                ? 'Suurimmat vastaanottajat'
                : 'Major Recipients'}
            </h2>
            <div className="space-y-3">
              {majorRecipients.map((recipient, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {language === 'fi' ? recipient.name : recipient.nameEn}
                    </p>
                    <p className="text-xs text-gray-500">{recipient.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">
                      {recipient.servesDaily}{' '}
                      {language === 'fi' ? 'hlö' : 'people'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {language === 'fi' ? 'päivittäin' : 'daily'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
