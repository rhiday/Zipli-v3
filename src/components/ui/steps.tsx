import React from 'react';
import { useCommonTranslation } from '@/lib/i18n-enhanced';

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  totalSteps: number;
  currentStep: number;
}

const Steps = React.forwardRef<HTMLDivElement, StepsProps>(
  ({ className, totalSteps, currentStep, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className="flex w-full items-center gap-1.5"
        {...props}
      >
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 grow rounded-[10px] ${
              index < currentStep ? 'bg-interactive' : 'bg-cloud'
            }`}
          />
        ))}
      </div>
    );
  }
);

Steps.displayName = t('common.steps');

export { Steps }; 