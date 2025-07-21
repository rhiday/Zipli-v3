'use client';

/**
 * LineChart Component
 * A simple line chart implementation using SVG
 */
import React from 'react';

export interface LineChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  height?: number;
  width?: number;
  lineColor?: string;
  className?: string;
  showLabels?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,
  width = 500,
  lineColor = '#10B981',
  className = '',
  showLabels = true
}) => {
  if (data.length < 2) {
    return <div className="p-4 text-sm text-gray-500">Not enough data points for a line chart</div>;
  }

  const values = data.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;
  
  // Add 10% padding to the top and bottom
  const paddingFactor = 0.1;
  const effectiveMinValue = minValue - range * paddingFactor;
  const effectiveMaxValue = maxValue + range * paddingFactor;
  const effectiveRange = effectiveMaxValue - effectiveMinValue;

  // Creating points for the line
  const pointSpacing = width / (data.length - 1);
  const points = data.map((item, index) => {
    const x = index * pointSpacing;
    const y = height - ((item.value - effectiveMinValue) / effectiveRange) * height;
    return { x, y, label: item.label, value: item.value };
  });

  // Create the SVG path
  const pathData = points
    .map((point, index) => (index === 0 ? `M ${point.x},${point.y}` : `L ${point.x},${point.y}`))
    .join(' ');

  return (
    <div className={className}>
      <svg width={width} height={height} className="overflow-visible">
        {/* The line */}
        <path
          d={pathData}
          fill="none"
          stroke={lineColor}
          strokeWidth="2"
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="white"
              stroke={lineColor}
              strokeWidth="2"
            />
            
            {/* Value labels */}
            {showLabels && (
              <>
                <text
                  x={point.x}
                  y={point.y - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6B7280"
                >
                  {point.value}
                </text>
                
                {/* X-axis labels */}
                <text
                  x={point.x}
                  y={height + 15}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#6B7280"
                >
                  {point.label}
                </text>
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};