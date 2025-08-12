'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SummaryItem {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

interface SummaryCardProps {
  title?: string;
  items: SummaryItem[];
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  items,
  className = "",
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h2 className="text-lg font-semibold text-[#021d13]">
          {title}
        </h2>
      )}
      
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-sm text-gray-600 flex-shrink-0 mr-4">
              {item.label}
            </span>
            <div className={cn(
              "text-sm font-medium text-gray-900 text-right flex-1",
              item.className
            )}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper component for displaying allergen chips
interface AllergenChipsProps {
  allergens: string[];
  className?: string;
}

export const AllergenChips: React.FC<AllergenChipsProps> = ({
  allergens,
  className = ""
}) => {
  if (!allergens.length) return <span className="text-gray-500">None</span>;
  
  return (
    <div className={cn("flex flex-wrap gap-1 justify-end max-w-[200px]", className)}>
      {allergens.map((allergen) => (
        <span
          key={allergen}
          className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex-shrink-0"
        >
          {allergen}
        </span>
      ))}
    </div>
  );
};

SummaryCard.displayName = 'SummaryCard';
AllergenChips.displayName = 'AllergenChips';