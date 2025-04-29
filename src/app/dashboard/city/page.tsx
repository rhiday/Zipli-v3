'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Mock data
const monthlyData = [
  { month: 'Jun', total: 12000, donated: 9000 },
  { month: 'Feb', total: 13500, donated: 10500 },
  { month: 'Mar', total: 14800, donated: 11200 },
  { month: 'Apr', total: 15200, donated: 12000 },
  { month: 'May', total: 16500, donated: 13000 },
  { month: 'Jun', total: 17200, donated: 13800 },
  { month: 'Jul', total: 18000, donated: 14500 },
  { month: 'Apr', total: 19500, donated: 15800 },
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
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">City of Helsinki</span>
          <span className="text-muted-foreground">Liisa Helme</span>
          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-muted-foreground">12 month overview</h2>
        <div className="grid grid-cols-5 gap-4">
          {stats.map((stat) => (
            <Card key={stat.id} className="p-4">
              <div className="mb-2 text-2xl">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <Card className="col-span-2 p-6">
          <h3 className="mb-4 text-xl font-semibold">Redistributed food</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Total"
                />
                <Line
                  type="monotone"
                  dataKey="donated"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Donated"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Surplus breakdown</h3>
          <div className="space-y-6">
            {surplusData.map((item) => (
              <div key={item.category}>
                <div className="mb-2 flex justify-between">
                  <span>{item.category}</span>
                  <span className="font-semibold">{item.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Climate goals development</h3>
          <div className="space-y-6">
            {climateGoals.map((goal) => (
              <div key={goal.title}>
                <div className="mb-2">
                  <div className="text-sm">{goal.title}</div>
                  <div className="font-semibold">{goal.percentage}%</div>
                </div>
                <div className="h-2 rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${goal.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Recommended actions for next 6 months</h3>
          <div className="grid grid-cols-3 gap-4">
            {recommendedActions.map((action) => (
              <div
                key={action.id}
                className="rounded-lg bg-green-50 p-4"
              >
                <h4 className="mb-2 font-semibold">{action.title}</h4>
                <p className="mb-4 text-sm text-muted-foreground">{action.description}</p>
                <button className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">
                  {action.action}
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 