'use client';

import React, { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';
import ExportCard from './ExportCard';

interface ImpactDashboardProps {
  totalWeight?: number;
  portionsOffered?: number;
  savedCosts?: number;
  emissionReduction?: number;
}

const ImpactDashboard: React.FC<ImpactDashboardProps> = ({
  totalWeight = 46,
  portionsOffered = 131,
  savedCosts = 125,
  emissionReduction = 89
}) => {
  const [selectedMonth, setSelectedMonth] = useState('February');

  return (
    <div className="bg-base rounded-t-3xl -mt-3 px-6 pt-6 pb-4">
      {/* Impact header with month selector */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-primary text-titleSm font-semibold">Your impact</h2>
        <button className="flex items-center text-interactive font-medium">
          {selectedMonth} <ChevronDown className="ml-1" size={20} />
        </button>
      </div>
      
      {/* Main impact stat */}
      <div className="mb-6">
        <h3 className="text-primary text-displaySm font-semibold mb-1">{totalWeight}kg</h3>
        <p className="text-secondary text-bodyLg">Total food offered</p>
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Portions stat */}
        <div className="bg-lime/20 rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-primary text-titleMd font-semibold">{portionsOffered}</span>
            <button className="p-0.5 text-secondary-25 hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-full">
              <Info size={16} />
            </button>
          </div>
          <p className="text-secondary text-caption">Portions offered</p>
        </div>
        
        {/* Costs stat */}
        <div className="bg-lime/20 rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-primary text-titleMd font-semibold">{savedCosts}€</span>
            <button className="p-0.5 text-secondary-25 hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-full">
              <Info size={16} />
            </button>
          </div>
          <p className="text-secondary text-caption">Saved in food disposal costs</p>
        </div>
        
        {/* Emission stat */}
        <div className="bg-lime/20 rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-primary text-titleMd font-semibold">{emissionReduction}%</span>
            <button className="p-0.5 text-secondary-25 hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-full">
              <Info size={16} />
            </button>
          </div>
          <p className="text-secondary text-caption">Emission reduction</p>
        </div>
      </div>
      
      {/* Export card */}
      <ExportCard />
      
      {/* This is whom you've helped section */}
      <div className="mt-8 pb-4">
        <h2 className="text-primary text-titleMd font-semibold mb-6">This is whom you've helped</h2>
        
        <div className="space-y-6">
          {/* Recipient 1 */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center overflow-hidden">
              <span className="text-rose-600 text-2xl font-bold">+</span>
            </div>
            <div>
              <h3 className="text-primary text-titleXs font-semibold">Red cross</h3>
              <p className="text-secondary text-bodyLg">500g · Beef stew</p>
            </div>
          </div>
          
          {/* Recipient 2 */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"></div>
            <div>
              <h3 className="text-primary text-titleXs font-semibold">Stadin Safka</h3>
              <p className="text-secondary text-bodyLg">500g · Beef stew</p>
            </div>
          </div>
          
          {/* Recipient 3 */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"></div>
            <div>
              <h3 className="text-primary text-titleXs font-semibold">Recipient name</h3>
              <p className="text-secondary text-bodyLg">500g · Beef stew</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactDashboard; 