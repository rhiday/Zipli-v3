'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Info, ChevronDown } from 'lucide-react';
import ExportCard from './ExportCard';
import { useTranslations } from '@/hooks/useTranslations';

interface ImpactDashboardProps {
  totalWeight?: number;
  portionsOffered?: number;
  savedCosts?: number;
  emissionReduction?: number;
}

const ImpactDashboard: React.FC<ImpactDashboardProps> = React.memo(
  ({
    totalWeight = 46,
    portionsOffered = 131,
    savedCosts = 125,
    emissionReduction = 89,
  }) => {
    const [selectedMonth, setSelectedMonth] = useState('February');

    // Memoized month selector handler
    const handleMonthSelect = useCallback(() => {
      // TODO: Implement month selection logic
    }, []);

    // Memoized stats data
    const statsData = useMemo(
      () => [
        {
          value: portionsOffered,
          label: 'Portions offered',
          bgColor: 'bg-lime/20',
        },
        {
          value: `${savedCosts}€`,
          label: 'Saved in food disposal costs',
          bgColor: 'bg-lime/20',
        },
        {
          value: `${emissionReduction}%`,
          label: 'Emission reduction',
          bgColor: 'bg-lime/20',
        },
      ],
      [portionsOffered, savedCosts, emissionReduction]
    );

    // Memoized recipients data
    const recipientsData = useMemo(
      () => [
        {
          id: 1,
          name: 'Red cross',
          info: '500g · Beef stew',
          avatar: { type: 'icon', color: 'rose', icon: '+' },
        },
        {
          id: 2,
          name: 'Stadin Safka',
          info: '500g · Beef stew',
          avatar: { type: 'placeholder', color: 'gray' },
        },
        {
          id: 3,
          name: 'Recipient name',
          info: '500g · Beef stew',
          avatar: { type: 'placeholder', color: 'gray' },
        },
      ],
      []
    );

    return (
      <div className="bg-base rounded-t-3xl -mt-3 px-6 pt-6 pb-4">
        {/* Impact header with month selector */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <h2 className="text-primary text-titleSm font-semibold flex-1">
            Your impact
          </h2>
          <button
            onClick={handleMonthSelect}
            className="flex items-center text-interactive font-medium whitespace-nowrap"
          >
            {selectedMonth} <ChevronDown className="ml-1" size={20} />
          </button>
        </div>

        {/* Main impact stat */}
        <div className="mb-6">
          <h3 className="text-primary text-displaySm font-semibold mb-1">
            {totalWeight}kg
          </h3>
          <p className="text-secondary text-bodyLg">Total food offered</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {statsData.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-xl p-4`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-primary text-titleMd font-semibold">
                  {stat.value}
                </span>
                <button className="p-0.5 text-secondary-25 hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-full">
                  <Info size={16} />
                </button>
              </div>
              <p className="text-secondary text-caption">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Export card */}
        <ExportCard />

        {/* This is whom you've helped section */}
        <div className="mt-8 pb-4">
          <h2 className="text-primary text-titleMd font-semibold mb-6">
            This is whom you've helped
          </h2>

          <div className="space-y-6">
            {recipientsData.map((recipient) => (
              <div key={recipient.id} className="flex items-center gap-4">
                <div
                  className={`h-16 w-16 rounded-full ${
                    recipient.avatar.type === 'icon'
                      ? 'bg-rose-100 flex items-center justify-center'
                      : 'bg-gray-200 flex items-center justify-center'
                  } overflow-hidden`}
                >
                  {recipient.avatar.type === 'icon' && (
                    <span className="text-rose-600 text-2xl font-bold">
                      {recipient.avatar.icon}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-primary text-titleXs font-semibold">
                    {recipient.name}
                  </h3>
                  <p className="text-secondary text-bodyLg">{recipient.info}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

ImpactDashboard.displayName = 'ImpactDashboard';

export default ImpactDashboard;
