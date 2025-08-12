'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StepItem {
  title: string;
  description: string;
}

interface NextStepsProps {
  heading: string;
  steps: StepItem[]; // first treated as completed
  className?: string;
}

export const NextSteps: React.FC<NextStepsProps> = ({ heading, steps, className }) => {
  return (
    <div className={cn('bg-gray-50 rounded-xl p-4 space-y-3', className)}>
      <h3 className="font-medium text-gray-900">{heading}</h3>
      {steps.map((step, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5',
            index === 0 ? 'bg-green-100' : 'bg-gray-200'
          )}>
            {index === 0 ? (
              <svg className="w-3 h-3 text-green-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <span className="text-xs font-medium text-gray-600">{index + 1}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{step.title}</p>
            <p className="text-xs text-gray-600">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

NextSteps.displayName = 'NextSteps';


