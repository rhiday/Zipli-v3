'use client';

/**
 * PieChart Component
 * A simple pie chart implementation using SVG
 */
import React from 'react';

export interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  className?: string;
}

export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  size = 200,
  className = '' 
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;
  
  let startAngle = 0;
  
  const createSlice = (item: PieChartData, index: number) => {
    if (total === 0) return null;
    
    const percentage = item.value / total;
    const endAngle = startAngle + percentage * 2 * Math.PI;
    
    // Calculate the outer points of the slice
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    // Create the SVG path for the slice
    const largeArcFlag = percentage > 0.5 ? 1 : 0;
    const pathData = [
      `M ${centerX},${centerY}`,
      `L ${x1},${y1}`,
      `A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}`,
      'Z'
    ].join(' ');
    
    const slice = (
      <path
        key={index}
        d={pathData}
        fill={item.color}
        stroke="#fff"
        strokeWidth="1"
      />
    );
    
    startAngle = endAngle;
    return slice;
  };
  
  const renderLegend = () => {
    return (
      <div className="mt-4 flex flex-wrap gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="mr-2 h-3 w-3" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-700">
              {item.label} ({Math.round(item.value / total * 100)}%)
            </span>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className={className}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map(createSlice)}
      </svg>
      {renderLegend()}
    </div>
  );
};