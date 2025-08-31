# Component Dependency Map & Architecture Guide

## 🏗️ Complete Component Architecture Analysis

This document provides a comprehensive map of UI component dependencies, data flows, and architectural patterns to ensure consistency in future development.

---

## 📊 Component Overview

### **Total Components: 48**

- **Base UI Components**: 12 (buttons, inputs, cards, etc.)
- **Form Components**: 8 (specialized form inputs and controls)
- **Display Components**: 6 (data visualization and presentation)
- **Navigation Components**: 5 (routing and navigation)
- **Authentication Components**: 4 (auth flows)
- **Dashboard Components**: 6 (role-specific dashboards)
- **Feature-Specific Components**: 7 (donations, requests, etc.)

---

## 🎯 Core Architecture Patterns

### **1. Root Layout Hierarchy**

```
RootLayout (app/layout.tsx)
├── AppShell
│   ├── DesktopGlobalNavbar (desktop only)
│   ├── [Page Content] (mobile container: max-w-md)
│   ├── BottomNav (mobile only, role-based)
│   └── ErrorBoundary
└── AuthProvider
```

### **2. Store Integration Pattern**

**Used by 15+ Core Components:**

```tsx
// Standard pattern across all components
import { useDatabase } from '@/store';

const {
  currentUser, // User state
  donations, // Data arrays
  addDonation, // CRUD operations
  fetchDonations, // Data fetching
  isInitialized, // Loading states
} = useDatabase();
```

### **3. Role-Based Navigation**

```tsx
// Components that adapt based on user role
- AppShell ← Different layouts per role
- BottomNav ← Different tabs per role
- DashboardLayout ← Role-specific dashboards
- MobileDashboardHeader ← Contextual headers
```

---

## 🔄 Data Flow Architecture

### **Primary Data Sources**

1. **Supabase Store** (`useDatabase`) - 15+ components
2. **Donation Store** (`useDonationStore`) - 8 components
3. **Request Store** (`useRequestStore`) - 6 components
4. **Auth Provider** - All protected components

### **Data Flow Patterns**

#### **Feed/List Pattern** (Used in 8+ components)

```tsx
// Components: donate/page.tsx, feed/page.tsx, dashboard components
1. Component mounts → useDatabase hook
2. Hook calls fetchDonations/fetchRequests
3. Data flows to display components (DonationCard, RequestCard)
4. Real-time subscriptions update automatically
```

#### **Create/Edit Pattern** (Used in 6+ components)

```tsx
// Components: donate/new, request/new, profile editing
1. Form components (PhotoUpload, AllergensDropdown, etc.)
2. Store actions (addDonation, updateProfile)
3. Optimistic updates → Real database call
4. Navigation to success/summary pages
```

---

## 🎨 Design System Analysis

### **Design Tokens** (`/src/lib/design-tokens.ts`)

```tsx
// Complete token system with 200+ values
export const tokens = {
  colors: {
    primary: { 50: '#f0f9f4', ..., 900: '#14532d' },
    semantic: { success, warning, error, info },
    surface: { background, foreground, muted, accent }
  },
  typography: {
    fontSizes: ['12px', '14px', '16px', '18px', '20px', '24px', '32px'],
    fontWeights: { normal: 400, medium: 500, semibold: 600, bold: 700 }
  },
  spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
  borderRadius: { none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999 }
};
```

### **Component Variants** (CVA Pattern)

```tsx
// Used in 10+ base components
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva('base-classes', {
  variants: {
    variant: { default, destructive, outline, secondary, ghost, link },
    size: { default, sm, lg, icon }
  }
});
```

### **Styling Consistency**

- **Mobile Container**: `max-w-md mx-auto` (applied to 20+ page components)
- **Card Pattern**: `bg-white rounded-xl shadow-sm border p-4` (8+ components)
- **Button Consistency**: CVA-based with standard variants (12+ components)
- **Form Layout**: `space-y-4` with consistent input styling (15+ forms)

---

## 📱 Responsive Design Patterns

### **Mobile-First Approach**

```tsx
// Standard responsive classes used across components
'block md:hidden'; // Mobile only (BottomNav)
'hidden md:block'; // Desktop only (DesktopGlobalNavbar)
'grid md:grid-cols-2'; // Responsive grid (dashboard layouts)
'px-4 md:px-6'; // Responsive spacing
```

### **Layout Components**

1. **AppShell** - Main responsive container
2. **MobileTabLayout** - Mobile-specific tabbed interfaces
3. **PageContainer** - Consistent page wrapper
4. **DashboardLayout** - Role-specific dashboard container

---

## 🔗 Component Dependencies

### **High-Dependency Components** (Used in 10+ places)

1. **Button** - Primary action component
2. **Input** - Form inputs across all flows
3. **Card** - Content container pattern
4. **Avatar** - User representations
5. **Skeleton** - Loading states

### **Integration Components** (Complex dependencies)

1. **AppShell** ← AuthProvider, multiple nav components
2. **DonationCard** ← useDatabase, Button, Avatar, Chip
3. **PhotoUpload** ← Image processing, storage integration
4. **AllergensDropdown** ← Multi-select, form integration

### **Isolated Components** (Low coupling)

1. **Icons** (BackArrowIcon, DeleteIcon, EditIcon)
2. **Loading components** (Skeleton)
3. **Static UI** (NextSteps, SummaryCard)

---

## 🚀 Future Development Guidelines

### **1. Component Creation Checklist**

- [ ] Follow CVA variant pattern for styling
- [ ] Use design tokens for all values
- [ ] Implement TypeScript interfaces
- [ ] Add mobile-first responsive design
- [ ] Include error states and loading states
- [ ] Document component in this map

### **2. Store Integration Standards**

```tsx
// Always use this pattern for new components
import { useDatabase } from '@/store';

const MyNewComponent = () => {
  const { data, loading, error, actions } = useDatabase();

  // Handle loading state
  if (loading) return <Skeleton />;

  // Handle error state
  if (error) return <ErrorMessage error={error} />;

  // Main component logic
  return <div>...</div>;
};
```

### **3. Design System Extensions**

When adding new design patterns:

1. Update design tokens first
2. Create CVA variants for reusability
3. Add to shared UI components
4. Update this documentation

### **4. Performance Considerations**

- Use React.memo for expensive components
- Implement lazy loading for route components
- Optimize image components with next/image
- Use skeleton loading states consistently

---

## 📋 Component Categories

### **Base UI Components (12)**

```tsx
src/components/ui/
├── button.tsx           ← CVA variants, primary actions
├── card.tsx            ← Content containers, consistent styling
├── input.tsx           ← Form inputs, validation integration
├── label.tsx           ← Form labels, accessibility
├── dialog.tsx          ← Modal dialogs, overlay patterns
├── drawer.tsx          ← Mobile drawer patterns
├── dropdown-menu.tsx   ← Action menus, selections
├── popover.tsx         ← Contextual overlays
├── progress.tsx        ← Loading indicators
├── radio-group.tsx     ← Selection inputs
├── steps.tsx           ← Multi-step flow indicators
└── tooltip.tsx         ← Help text, information
```

### **Form Components (8)**

```tsx
src/components/ui/
├── AllergensDropdown.tsx      ← Multi-select with predefined options
├── DatePicker.tsx            ← Date selection with calendar
├── PhotoUpload.tsx           ← Image upload with preview
├── RecurrenceSelector.tsx    ← Recurring donation settings
├── Select.tsx                ← Dropdown selections
├── Textarea.tsx              ← Multi-line text input
├── TimeSlotSelector.tsx      ← Time selection interface
└── VoiceInputControl.tsx     ← Audio recording interface
```

### **Display Components (6)**

```tsx
src/components/
├── ui/Avatar.tsx             ← User profile images
├── ui/Chip.tsx              ← Status indicators, tags
├── ui/ItemPreview.tsx       ← Food item display cards
├── ui/Skeleton.tsx          ← Loading state components
├── ui/SummaryCard.tsx       ← Data summary displays
└── graphs/                  ← Data visualization (LineChart, PieChart)
```

### **Navigation Components (5)**

```tsx
src/components/
├── AppShell.tsx             ← Main layout wrapper
├── BottomNav.tsx            ← Mobile navigation tabs
├── DesktopGlobalNavbar.tsx  ← Desktop navigation
├── MobileDashboardHeader.tsx ← Page headers
└── ui/SecondaryNavbar.tsx   ← Sub-navigation
```

---

## 🔄 Update Protocol

### **When to Update This Document**

1. **New Components Added** - Add to appropriate category
2. **Major Store Changes** - Update data flow sections
3. **Design System Changes** - Update tokens and patterns
4. **Architecture Refactoring** - Update dependency maps
5. **Performance Optimizations** - Update guidelines

### **Version History**

- **v1.0** - Initial architecture analysis and component mapping
- **Last Updated** - August 2025 (post-architecture-fixes)

---

**This document ensures consistent, maintainable, and scalable UI development across the entire Zipli platform.**
