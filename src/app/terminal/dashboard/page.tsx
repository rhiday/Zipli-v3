'use client';

import { TerminalUIShell } from '@/components/terminal/TerminalUIShell';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/DatePicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { isTestData } from '@/lib/data-filters';
import { useCommonTranslation } from '@/lib/i18n-enhanced';
import { supabase } from '@/lib/supabase/client';
import { useDatabase } from '@/store';
import {
  Activity,
  BarChart3,
  Calendar,
  Download,
  Eye,
  FileText,
  Filter,
  Package,
  Truck,
  Leaf,
  Building2,
  TrendingUp,
  Users,
  Sparkles,
  X,
  Send,
  Euro,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  Label,
} from 'recharts';

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
  // NEW optional fields for extended columns
  pickup_place?: string | null;
  delivery_place?: string | null;
  delivery_status?: string | null;
  request_description?: string | null;
  requested_quantity?: number | null;
  raw_data: any; // Keep original data for modals
};

export default function TerminalOverview() {
  const router = useRouter();
  const { currentUser, isInitialized } = useDatabase();
  const { t, language } = useCommonTranslation();

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

  // Chatbot state
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'bot', message: string}[]>([
    { role: 'bot', message: 'Hi! I can help explain your dashboard data. Ask me about your metrics, waste reduction goals, or anything else!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatMessagesRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [chatMessages]);

  // Chart scenario toggles
  const [showForecast, setShowForecast] = useState(false);
  const [showEUGoals, setShowEUGoals] = useState(false);
  const [showAmbitious, setShowAmbitious] = useState(false);

  // Terminal-specific analytics (from real data)
  const analytics = useMemo(() => {
    const donations = terminalItems.filter((item) => item.type === 'donation');

    const totalKg = donations.reduce((sum, d) => {
      const quantity =
        parseFloat(String(d.quantity).replace(/[^\d.]/g, '')) || 0;
      return sum + quantity;
    }, 0);

    // Mock previous month data for growth calculations
    const prevMonthVolume = totalKg / 1.07; // 7% growth
    const prevMonthValue = (totalKg * 20) / 1.08; // 8% growth, ~€20/kg avg

    // Calculate metrics
    const totalValue = totalKg * 20; // Average €20 per kg
    const valueGrowth = ((totalValue - prevMonthValue) / prevMonthValue * 100).toFixed(1);
    const volumeGrowth = ((totalKg - prevMonthVolume) / prevMonthVolume * 100).toFixed(1);

    // Count unique organizations
    const uniqueOrgs = new Set(
      terminalItems.map((i) => i.organization_name).filter(Boolean)
    ).size;
    const newOrgsThisMonth = Math.max(0, Math.floor(uniqueOrgs * 0.15)); // ~15% are new

    const CO2_PER_KG = 2.5; // kg CO2e avoided per kg rescued
    const co2SavedKg = Math.round(totalKg * CO2_PER_KG);

    // Waste reduction (same as volume distributed)
    const wasteReduction = totalKg;
    const wasteGrowth = volumeGrowth; // Same growth as volume

    return {
      totalKg: `${totalKg.toFixed(1)}kg`,
      activeOrganizations: uniqueOrgs,
      co2Saved: `${co2SavedKg.toLocaleString()}kg CO₂e`,
      totalValueOfFoodSold: totalValue.toFixed(2),
      valueGrowth,
      totalKgDistributed: totalKg.toFixed(1),
      volumeGrowth,
      organizationsReached: uniqueOrgs,
      newOrgsThisMonth,
      wasteReduction: wasteReduction.toFixed(1),
      wasteGrowth,
    };
  }, [terminalItems]);

  // Waste reduction chart data (showing progress from 2023 to 2030 goal)
  const wasteReductionChartData = useMemo(() => {
    // Story: Started at 200kg in 2023, currently at 126kg, target is 88kg by 2030 (-30%)
    const data = [
      { year: '2023', current: 200, target: 200, forecast: 200, euGoals: 200, ambitious: 200 }, // Starting point
      { year: '2024', current: 170, target: 170, forecast: 170, euGoals: 170, ambitious: 170 }, // Progress made
      { year: '2025', current: 126, target: 126, forecast: 126, euGoals: 126, ambitious: 126 }, // Today - current state
      { year: '2026', current: 126, target: 118, forecast: 122, euGoals: 118, ambitious: 116 }, // Scenarios diverge
      { year: '2027', current: 126, target: 110, forecast: 118, euGoals: 110, ambitious: 106 },
      { year: '2028', current: 126, target: 102, forecast: 114, euGoals: 102, ambitious: 94 },
      { year: '2029', current: 126, target: 95, forecast: 112, euGoals: 95, ambitious: 86 },
      { year: '2030', current: 126, target: 88, forecast: 110, euGoals: 88, ambitious: 78 },  // Endpoints: Target 88kg (-30%), Forecast 110kg, Ambitious 78kg (-38%)
    ];
    return data;
  }, []);

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
            donor:profiles!donor_id (full_name, organization_name, email, address),
            receiver:profiles!receiver_id (organization_name, address)
          `),
        supabase.from('requests').select(`
            *,
            requester:profiles (full_name, organization_name, email, address)
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
        (d: any) => !isTestData(d.donor?.email, d.donor?.organization_name)
      );
      const filteredRequests = requestsData.filter(
        (r: any) =>
          !isTestData(r.requester?.email, r.requester?.organization_name)
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
              d.donor?.organization_name ||
              d.donor?.full_name ||
              'Unknown Donor',
            category: 'Donation',
            food_category: d.food_items?.food_type || 'Other',
            quantity: `${parseFloat(d.quantity) || 0}${d.unit || 'kg'}`,
            status: d.status,
            processing_status,
            location:
              d.address ||
              `${d.donor?.organization_name || 'Unknown'} Location`,
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
            // NEW enriched fields
            pickup_place: d.donor?.address ?? null,
            delivery_place: d.receiver?.address ?? null,
            delivery_status: processing_status || d.status || null,
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
            r.requester?.organization_name ||
            r.requester?.full_name ||
            'Unknown Receiver',
          category: 'Request',
          quantity: `${r.people_count || 0} people`,
          status: r.status,
          urgency: r.priority || 'medium',
          location:
            r.address ||
            `${r.requester?.organization_name || 'Unknown'} Location`,
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
          // NEW enriched fields
          pickup_place: null,
          delivery_place: r.requester?.address ?? null,
          delivery_status: r.status || null,
          request_description: r.description ?? null,
          requested_quantity: r.people_count ?? null,
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

  // ESC key to collapse chat sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !chatCollapsed) {
        setChatCollapsed(true);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [chatCollapsed]);

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

  // Chatbot message handler
  const handleSendMessage = useCallback(() => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', message: userMessage }]);
    setChatInput('');
    setIsTyping(true);

    // Generate mock response based on keywords and dashboard data
    setTimeout(() => {
      let botResponse = '';
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes('value') || lowerMessage.includes('revenue') || lowerMessage.includes('money') || lowerMessage.includes('euro')) {
        botResponse = `Your total value of food sold is €${analytics.totalValueOfFoodSold}, which shows a ${analytics.valueGrowth}% growth from last month. This indicates strong performance in food distribution value!`;
      } else if (lowerMessage.includes('kg') || lowerMessage.includes('volume') || lowerMessage.includes('distributed') || lowerMessage.includes('weight')) {
        botResponse = `You've distributed ${analytics.totalKgDistributed} kg of food so far, with a ${analytics.volumeGrowth}% increase from last month. Great progress on reducing food waste!`;
      } else if (lowerMessage.includes('organization') || lowerMessage.includes('partner') || lowerMessage.includes('client')) {
        botResponse = `You've reached ${analytics.organizationsReached} organizations, with ${analytics.newOrgsThisMonth} new partners this month. Your network is growing steadily!`;
      } else if (lowerMessage.includes('waste') || lowerMessage.includes('reduction') || lowerMessage.includes('2030') || lowerMessage.includes('goal')) {
        botResponse = `Your waste reduction is ${analytics.wasteReduction} kg (${analytics.wasteGrowth}% growth). Looking at the chart, you're currently on track but slightly below the 30% reduction target for 2030. The blue line shows your current progress, while the orange dashed line shows the target path.`;
      } else if (lowerMessage.includes('chart') || lowerMessage.includes('graph')) {
        botResponse = 'The waste reduction chart shows your progress towards the 2030 goal of 30% waste reduction. The solid blue line represents your current waste levels, while the dashed orange line shows the target trajectory. You\'re making good progress but there\'s room for improvement!';
      } else if (lowerMessage.includes('improve') || lowerMessage.includes('better') || lowerMessage.includes('increase')) {
        botResponse = 'To improve your metrics, consider: 1) Partnering with more local organizations, 2) Optimizing pickup routes for efficiency, 3) Increasing awareness about food donation programs. Your current growth rate is positive!';
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        botResponse = 'Hello! How can I help you understand your dashboard data today? Feel free to ask about your metrics, growth trends, or waste reduction goals.';
      } else if (lowerMessage.includes('thank')) {
        botResponse = 'You\'re welcome! Let me know if you have any other questions about your dashboard data.';
      } else {
        // Default response with overview
        botResponse = `Here's a quick overview: You've sold €${analytics.totalValueOfFoodSold} worth of food (+${analytics.valueGrowth}%), distributed ${analytics.totalKgDistributed} kg (+${analytics.volumeGrowth}%), and reached ${analytics.organizationsReached} organizations. Your waste reduction is at ${analytics.wasteReduction} kg. What would you like to know more about?`;
      }

      setChatMessages(prev => [...prev, { role: 'bot', message: botResponse }]);
      setIsTyping(false);
    }, 800);
  }, [chatInput, analytics]);

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-cloud flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser || !['terminals', 'sodexo_admin'].includes(currentUser.role)) {
    router.push('/auth/login');
    return null;
  }

  return (
    <TerminalUIShell>
      <div className={`transition-all duration-300 ${chatCollapsed ? 'mr-10' : 'mr-0 sm:mr-[320px]'}`}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total value of food sold
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    €24,875.50
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +8% from last month
                  </p>
                </div>
                <Euro className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total kg of food distributed
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    1,245
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +7% from last month
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Organizations Reached
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    28
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    4 new this month
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
                  <p className="text-3xl font-bold text-blue-600">
                    875 kg
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    15.2% from last month
                  </p>
                </div>
                <Leaf className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waste Reduction Progress Chart */}
      <section className="px-4 sm:px-6 pb-6">
        <div className="max-w-full mx-auto">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Food waste per restaurant
            </h3>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={300} minWidth={300}>
              <LineChart
                data={wasteReductionChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                {/* Shade the past data (2023-2025) */}
                <ReferenceArea
                  x1="2023"
                  x2="2025"
                  fill="#000000"
                  fillOpacity={0.05}
                />

                <XAxis
                  dataKey="year"
                  stroke="#6b7280"
                  style={{ fontSize: '14px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '14px' }}
                  label={{
                    value: 'kg/month',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: '14px', fill: '#6b7280' },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '14px' }}
                  iconType="line"
                />

                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Business as usual"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#ea580c"
                  strokeWidth={3}
                  name="Target (-30% by 2030)"
                  dot={{ fill: '#ea580c', r: 4 }}
                  strokeDasharray="5 5"
                />

                {/* Conditional scenario lines - only show when toggled */}
                {showForecast && (
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#9333ea"
                    strokeWidth={3}
                    name="Realistic Forecast"
                    dot={{ fill: '#9333ea', r: 4 }}
                  />
                )}

                {showEUGoals && (
                  <Line
                    type="monotone"
                    dataKey="euGoals"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="EU Goals (-30%)"
                    dot={{ fill: '#f59e0b', r: 4 }}
                    strokeDasharray="8 4"
                  />
                )}

                {showAmbitious && (
                  <Line
                    type="monotone"
                    dataKey="ambitious"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Ambitious Goal (-38%)"
                    dot={{ fill: '#10b981', r: 4 }}
                    strokeDasharray="4 4 1 4"
                  />
                )}

                {/* Mark "Today" with vertical line */}
                <ReferenceLine
                  x="2025"
                  stroke="#6b7280"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                >
                  <Label
                    value="Today"
                    position="top"
                    fill="#6b7280"
                    fontSize={12}
                    offset={10}
                  />
                </ReferenceLine>

                {/* Highlight current data point with label */}
                <ReferenceDot
                  x="2025"
                  y={126}
                  r={6}
                  fill="#3b82f6"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  <Label
                    value="126 kg"
                    position="top"
                    fill="#3b82f6"
                    fontSize={13}
                    fontWeight="bold"
                    offset={15}
                  />
                </ReferenceDot>
              </LineChart>
            </ResponsiveContainer>
            </div>

            {/* Scenario Toggle Buttons */}
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setShowForecast(!showForecast)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showForecast
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                Check forecast
              </button>
              <button
                onClick={() => setShowEUGoals(!showEUGoals)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showEUGoals
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                Check EU goals
              </button>
              <button
                onClick={() => setShowAmbitious(!showAmbitious)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showAmbitious
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                Ambitious goal
              </button>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* AI Chat Panel - Always Visible */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-40 border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
          chatCollapsed ? 'w-10' : 'w-full sm:w-[320px]'
        }`}
      >
        {/* Sidebar Header */}
        <div className="bg-green-600 text-white px-4 py-4 flex items-center justify-between">
          {!chatCollapsed && (
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-base">Dashboard Assistant</h3>
                <p className="text-xs text-green-100">Ask me about your metrics</p>
              </div>
            </div>
          )}
          {chatCollapsed && (
            <div className="flex items-center justify-center w-full">
              <Sparkles className="w-6 h-6" />
            </div>
          )}
          <button
            onClick={() => setChatCollapsed(!chatCollapsed)}
            className="hover:bg-green-700 rounded-lg p-2 transition-colors flex-shrink-0"
            title={chatCollapsed ? 'Expand chat' : 'Collapse chat'}
          >
            {chatCollapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        {!chatCollapsed && (
          <>
            {/* Chat Messages */}
            <div
              ref={chatMessagesRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white"
            >
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about your metrics..."
                  disabled={isTyping}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Button
                  type="submit"
                  disabled={isTyping || !chatInput.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

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
