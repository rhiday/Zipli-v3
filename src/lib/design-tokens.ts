/**
 * ZIPLI DESIGN TOKENS
 * 
 * Centralized design system constants to prevent magic values
 * and ensure UI consistency across components.
 * 
 * Usage: Import these instead of hardcoding values
 * ❌ Don't: className="text-[#021d13] rounded-[12px]"  
 * ✅ Do: className={`text-${COLORS.primary} rounded-${RADIUS.md}`}
 */

export const COLORS = {
  // Primary palette
  primary: 'primary',
  'primary-50': 'primary-50', 
  'primary-75': 'primary-75',
  earth: 'earth',
  lime: 'lime',
  cream: 'cream',
  
  // Semantic colors
  secondary: 'secondary',
  tertiary: 'tertiary', 
  interactive: 'interactive',
  accent: 'accent',
  
  // States
  positive: 'positive',
  'positive-hover': 'positive-hover',
  negative: 'negative',
  'negative-hover': 'negative-hover',
  
  // UI
  border: 'border',
  inactive: 'inactive',
  base: 'base',
  cloud: 'cloud'
} as const;

export const RADIUS = {
  xs: 'xs',   // 3px - super small
  sm: 'sm',   // 6px - small  
  md: 'md',   // 12px - buttons/inputs
  lg: 'lg'    // 24px - large
} as const;

export const SPACING = {
  icon: 'icon',        // 14px
  'icon-xs': 'icon-xs', // 12px
  'icon-md': 'icon-md', // 18px  
  'icon-lg': 'icon-lg', // 20px
  'icon-xl': 'icon-xl'  // 28px
} as const;

export const TYPOGRAPHY = {
  label: 'text-label',
  body: 'text-body', 
  bodyLg: 'text-bodyLg',
  titleSm: 'text-titleSm',
  titleMd: 'text-titleMd'
} as const;

// Common component patterns
export const COMPONENT_PATTERNS = {
  // Buttons
  buttonBase: `inline-flex items-center justify-center rounded-${RADIUS.md} font-medium transition-colors`,
  buttonPrimary: `bg-${COLORS.lime} text-${COLORS.primary} hover:bg-${COLORS['positive-hover']}`,
  buttonSecondary: `bg-${COLORS.base} border border-${COLORS.border} text-${COLORS.primary} hover:bg-${COLORS.cloud}`,
  
  // Cards  
  cardBase: `bg-${COLORS.base} rounded-${RADIUS.lg} border border-${COLORS.border} shadow-sm`,
  
  // Input fields
  inputBase: `w-full px-3 py-2 rounded-${RADIUS.md} border border-${COLORS.border} bg-${COLORS.base} text-${COLORS.primary}`,
  
  // Layout containers
  pageContainer: 'min-h-screen bg-cream',
  contentContainer: 'relative mx-auto flex h-screen w-full max-w-lg flex-col bg-base shadow-lg'
} as const;

// Breakpoint helpers
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px'
} as const;

// Component size variants
export const SIZES = {
  button: {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4', 
    lg: 'h-12 px-6 text-lg'
  },
  input: {
    sm: 'h-8 text-sm',
    md: 'h-10',
    lg: 'h-12 text-lg'  
  }
} as const;