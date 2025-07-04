'use client';

import React from 'react';
// import { Card } from '@/components/ui/card'; // Removed
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { ActionButton } from '@/components/ui/action-button';
import { Download, Store } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
// Removed resolveConfig and tailwindConfig imports

// Removed getColor helper function and theme color extraction

// Mock data
const monthlyData = [
  { month: 'Jun', total: 12000, donated: 9000 },
  { month: 'Feb', total: 13500, donated: 10500 },
  { month: 'Mar', total: 14800, donated: 11200 },
  { month: 'Apr', total: 15200, donated: 12000 },
  { month: 'May', total: 16500, donated: 13000 },
  { month: 'Jun', total: 17200, donated: 13800 },
  { month: 'Jul', total: 18000, donated: 14500 },
  { month: 'Aug', total: 19500, donated: 15800 },
];

const stats = [
  {
    id: 1,
    value: '356,250 €',
    label: 'Costs avoided',
    icon: '💶',
  },
  {
    id: 2,
    value: '142,500',
    label: 'Meals served',
    icon: '🍽️',
  },
  {
    id: 3,
    value: '178,125 kg',
    label: 'CO2 emissions avoided',
    icon: '🌱',
  },
  {
    id: 4,
    value: '142,500,000 l',
    label: 'Freshwater saved',
    icon: '💧',
  },
  {
    id: 5,
    value: '17.81 hectares',
    label: 'Agricultural land saved',
    icon: '🌾',
  },
];

const surplusData = [
  { category: 'Employee canteens', percentage: 83 },
  { category: 'School canteens', percentage: 73 },
];

const climateGoals = [
  {
    title: 'Targeted food-related emissions reduction by 2030',
    percentage: 42,
  },
  {
    title: 'Targeted total food waste reduction by 2030',
    percentage: 55,
  },
];

const recommendedActions = [
  {
    id: 1,
    title: 'Launch "Zero Waste Kitchen" challenge',
    description: 'Engage top food waste producers in a 3-month commitment',
    action: 'Launch campaign',
  },
  {
    id: 2,
    title: 'Set new "Weekly Waste Cap"',
    description: 'Use smart caps to manage kitchen waste',
    action: 'Set smart caps',
  },
  {
    id: 3,
    title: 'Activate logistics boost',
    description: 'Offer free pickups for organizations to weekly surplus',
    action: 'Select eligible partners',
  },
];

export default function CityDashboard() {
  // Removed color variable definitions

  return (
    <div className="min-h-screen bg-cream p-6 md:p-8 lg:p-12"> {/* Use new bg color and spacing */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-titleMd font-display text-primary">Dashboard</h1> {/* Use new typography */}
        <div className="flex items-center gap-4">
        <Link href="/admin/qr-login">
  <span className="text-body text-primary-75 cursor-pointer">
    QR Login phone
  </span>
  </Link>
          <span className="text-body text-primary-75">City of Helsinki</span> {/* Use new text colors */}
          <span className="text-body text-primary-75">Liisa Helme</span>
          {/* Replace placeholder with an actual Avatar component if available, or style a div */}
          <div className="h-10 w-10 rounded-full bg-primary-25 flex items-center justify-center text-label text-primary">LH</div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mb-8">
        <h2 className="mb-4 text-bodyLg font-medium text-primary-75">12 month overview</h2> {/* Use new typography/color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6"> {/* Adjust grid/gap */}
          {stats.map((stat) => (
            // Replace Card with styled div
            <div key={stat.id} className="rounded-lg bg-base p-4 shadow"> {/* Use new bg/shadow */}
              <div className="mb-2 text-titleSm">{stat.icon}</div> {/* Adjust icon size/margin if needed */}
              <div className="text-stat font-medium text-primary">{stat.value}</div> {/* Use new typography/color */}
              <div className="text-label text-primary-75">{stat.label}</div> {/* Use new typography/color */}
            </div>
          ))}
        </div>
      </div>

      {/* Charts and Breakdown Section */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"> {/* Adjust grid/gap */}
        {/* Redistributed Food Chart */}
        <div className="rounded-lg bg-base p-6 shadow lg:col-span-2"> {/* Use new bg/shadow */}
          <h3 className="mb-4 text-titleXs font-display text-primary">Redistributed food</h3> {/* Use new typography */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {/* Use CSS variables for colors */}
              <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-primary-25)" />
                <XAxis dataKey="month" stroke="var(--color-primary-75)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--color-primary-75)" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-base)', border: `1px solid var(--color-primary-10)` }}/>
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="var(--color-primary)" // Use CSS variable
                  strokeWidth={2}
                  name="Total"
                  dot={{ r: 4, fill: 'var(--color-primary)' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="donated"
                  stroke="var(--color-earth)" // Use CSS variable
                  strokeWidth={2}
                  name="Donated"
                  dot={{ r: 4, fill: 'var(--color-earth)' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* This div is now a container for the tabs */}
        <div className="rounded-lg bg-base p-6 shadow">
          <Tabs defaultValue="breakdown">
            <TabsList>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="breakdown">
              <div className="space-y-6 mt-4">
                <div>
                  <h3 className="mb-4 text-titleXs font-display text-primary">Surplus breakdown</h3>
                  {surplusData.map((item) => (
                    <div key={item.category} className="mb-4">
                      <div className="mb-2 flex justify-between text-body text-primary">
                        <span>{item.category}</span>
                        <span className="font-semibold">{item.percentage}%</span>
                      </div>
                      <Progress value={item.percentage} />
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="mb-4 text-titleXs font-display text-primary">Climate goals development</h3>
                  {climateGoals.map((goal) => (
                    <div key={goal.title} className="mb-4">
                       <div className="mb-2">
                        <div className="text-body text-primary">{goal.title}</div>
                        <div className="text-bodyLg font-semibold text-primary">{goal.percentage}%</div>
                      </div>
                      <Progress value={goal.percentage} className="[&>*]:bg-blue" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="recommendations">
              <div className="mt-4">
                <h3 className="mb-4 text-titleXs font-display text-primary">Recommended actions for next 6 months</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedActions.map((action) => (
                    <div
                      key={action.id}
                      className="rounded-lg bg-sky-10 p-4 flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="mb-2 text-label font-semibold text-primary">{action.title}</h4>
                        <p className="mb-4 text-caption text-primary-75">{action.description}</p>
                      </div>
                      <Button variant="secondary" size="sm">
                        {action.action}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reports">
              <div className="mt-4">
                <h3 className="mb-4 text-titleXs font-display text-primary">Reports & Actions</h3>
                <div className="mb-6">
                  <Link href="#" passHref>
                    <Button variant="tertiary" asChild>
                      <a>Export to PDF</a>
                    </Button>
                  </Link>
                  <p className="mt-2 text-body text-primary-75">
                    Environmental and social impact data for reporting, and operation planning.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActionButton
                    href="#"
                    title="Export Surplus Data to PDF"
                    description="Environmental and social impact data for reporting, and operation planning."
                    icon={<Download />}
                    variant="highlighted"
                  />
                  <ActionButton
                    href="#"
                    title="Manage Partner Stores"
                    description="View and manage connected food donors and receivers."
                    icon={<Store />}
                  />
                  <ActionButton
                    href="#"
                    title="Generate Annual Impact Report"
                    description="This feature is coming soon."
                    icon={<Download />}
                    disabled
                  />
                  <ActionButton
                    href="#"
                    title="Onboard New Store"
                    description="This feature is coming soon."
                    icon={<Store />}
                    disabled
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 