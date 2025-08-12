/**
 * SAFE COMPONENT UTILITIES
 * 
 * Helper functions to make UI changes safely without breaking existing components.
 * These utilities enforce consistency and provide safe defaults.
 */

import { cn } from '@/lib/utils';
import { COLORS, RADIUS, COMPONENT_PATTERNS, SIZES } from './design-tokens';

// Button variant builder - prevents inconsistent button styles
export const buildButtonClasses = (
  variant: 'primary' | 'secondary' | 'tertiary' | 'destructive' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md',
  className?: string
) => {
  const baseClasses = COMPONENT_PATTERNS.buttonBase;
  
  const variants = {
    primary: COMPONENT_PATTERNS.buttonPrimary,
    secondary: COMPONENT_PATTERNS.buttonSecondary,
    tertiary: `bg-transparent text-${COLORS.primary} hover:bg-${COLORS.cloud}`,
    destructive: `bg-${COLORS.negative} text-white hover:bg-${COLORS['negative-hover']}`
  };
  
  return cn(
    baseClasses,
    variants[variant],
    SIZES.button[size],
    className
  );
};

// Card wrapper - ensures consistent card styling
export const buildCardClasses = (
  variant: 'default' | 'elevated' | 'outlined' = 'default', 
  padding: 'sm' | 'md' | 'lg' = 'md',
  className?: string
) => {
  const baseClasses = COMPONENT_PATTERNS.cardBase;
  
  const variants = {
    default: '',
    elevated: 'shadow-lg',
    outlined: `border-2 border-${COLORS.border}`
  };
  
  const paddings = {
    sm: 'p-3',
    md: 'p-4', 
    lg: 'p-6'
  };
  
  return cn(
    baseClasses,
    variants[variant],
    paddings[padding],
    className
  );
};

// Input field builder - consistent form styling
export const buildInputClasses = (
  state: 'default' | 'error' | 'success' = 'default',
  size: 'sm' | 'md' | 'lg' = 'md',
  className?: string
) => {
  const baseClasses = COMPONENT_PATTERNS.inputBase;
  
  const states = {
    default: `border-${COLORS.border} focus:border-${COLORS.interactive}`,
    error: `border-${COLORS.negative} focus:border-${COLORS.negative}`,
    success: `border-${COLORS.positive} focus:border-${COLORS.positive}`
  };
  
  return cn(
    baseClasses,
    states[state],
    SIZES.input[size],
    'focus:outline-none focus:ring-2 focus:ring-opacity-50',
    className
  );
};

// Layout helpers - consistent spacing and structure
export const layoutClasses = {
  pageWrapper: COMPONENT_PATTERNS.pageContainer,
  contentWrapper: COMPONENT_PATTERNS.contentContainer,
  section: `space-y-4`,
  sectionLarge: `space-y-6`,
  grid2Col: `grid grid-cols-1 md:grid-cols-2 gap-4`,
  flexBetween: `flex items-center justify-between`,
  flexCenter: `flex items-center justify-center`,
  stackSmall: `flex flex-col gap-2`,
  stackMedium: `flex flex-col gap-4`,
  stackLarge: `flex flex-col gap-6`
};

// Typography helpers - consistent text styling
export const textClasses = {
  heading1: `text-titleMd font-semibold text-${COLORS.primary}`,
  heading2: `text-titleSm font-semibold text-${COLORS.primary}`,
  bodyText: `text-body text-${COLORS.primary}`,
  bodyLarge: `text-bodyLg text-${COLORS.primary}`,
  label: `text-label font-medium text-${COLORS.primary}`,
  caption: `text-sm text-${COLORS.secondary}`,
  muted: `text-sm text-${COLORS.tertiary}`,
  error: `text-sm text-${COLORS.negative}`,
  success: `text-sm text-${COLORS.positive}`
};

// Animation helpers - consistent transitions
export const animationClasses = {
  transition: 'transition-all duration-200 ease-in-out',
  fadeIn: 'animate-in fade-in-0 duration-200',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
  hover: 'hover:scale-105 transition-transform duration-200'
};

// Validation helper - prevents invalid class combinations
export const validateClasses = (classes: string): string => {
  const classArray = classes.split(' ');
  const warnings: string[] = [];
  
  // Check for arbitrary values (should use design tokens)
  classArray.forEach(cls => {
    if (cls.includes('[') && cls.includes(']')) {
      warnings.push(`Arbitrary value detected: ${cls}. Use design tokens instead.`);
    }
  });
  
  // Check for non-standard colors
  const colorClasses = classArray.filter(cls => 
    cls.startsWith('bg-') || cls.startsWith('text-') || cls.startsWith('border-')
  );
  
  if (process.env.NODE_ENV === 'development' && warnings.length > 0) {
    console.warn('UI Guidelines Violation:', warnings);
  }
  
  return classes;
};

// Safe class merger - validates and combines classes
export const safeClassMerge = (...classes: (string | undefined)[]): string => {
  const merged = cn(...classes);
  return validateClasses(merged);
};