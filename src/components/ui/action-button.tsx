import React from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const actionButtonVariants = cva(
  'group flex items-center p-4 rounded-lg border transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-base hover:bg-cream',
        highlighted: 'bg-cream hover:bg-base',
      },
      disabled: {
        true: 'bg-cloud border-transparent pointer-events-none',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface ActionButtonProps extends VariantProps<typeof actionButtonVariants> {
  href: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

const ActionButton = ({
  href,
  title,
  description,
  icon,
  variant,
  disabled,
  className,
}: ActionButtonProps) => {
  const isDisabled = disabled === true;
  const content = (
    <div className={cn(actionButtonVariants({ variant, disabled }), className)}>
      {icon && <div className={cn('mr-4 h-7 w-7', { 'text-inactive': isDisabled })}>{icon}</div>}
      <div className="flex-1">
        <p className={cn('font-semibold text-primary', { 'text-inactive': isDisabled })}>
          {title}
        </p>
        <p className={cn('text-sm text-secondary', { 'text-inactive': isDisabled })}>
          {description}
        </p>
      </div>
      <ChevronRight className={cn('h-5 w-5 ml-4 text-primary group-hover:translate-x-1 transition-transform', { 'text-inactive': isDisabled })} />
    </div>
  );

  if (isDisabled) {
    return <div>{content}</div>;
  }

  return (
    <Link href={href} className="focus:outline-none focus:ring-2 focus:ring-interactive rounded-lg">
      {content}
    </Link>
  );
};

ActionButton.displayName = 'ActionButton';

export { ActionButton }; 