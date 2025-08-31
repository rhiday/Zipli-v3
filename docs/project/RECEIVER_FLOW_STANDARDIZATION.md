# Receiver Flow UI Standardization Project

## Overview

The current receiver (request) flow has inconsistent design patterns compared to the polished donor (donation) flow. This project will standardize the receiver flow to match the same quality and design cohesion.

## Design System Reference

Use the **donation flow** as the gold standard for:

- Navigation patterns (`SecondaryNavbar`)
- Color scheme (`#F5F9EF`, `#024209`, `text-interactive`)
- Layout structure (`h-dvh` with proper footer)
- Component styling (buttons, progress, forms)
- User experience flow

## Task Implementation Guidelines

### Phase 1: Foundation Fixes (Critical)

**Goal**: Make basic structure consistent

#### Task 1: Standardize Navigation

**Files**: `/src/app/request/new/page.tsx`, `/src/app/request/pickup-slot/page.tsx`, `/src/app/request/summary/page.tsx`

- Replace custom headers with `SecondaryNavbar` component
- Remove manual `ChevronLeft` implementations
- Use consistent back navigation patterns from donation flow
- **Reference**: See how `/src/app/donate/manual/page.tsx` implements navigation

#### Task 2: Unify Color Scheme

**Files**: All request flow pages

- Replace `bg-cream`, `bg-base` with consistent backgrounds
- Apply green theme colors: `#F5F9EF`, `#024209`
- Use `text-interactive` for accent colors
- Match card styling from donation flow (rounded corners, borders)
- **Reference**: Copy color patterns from `/src/app/donate/pickup-slot/page.tsx`

#### Task 3: Fix Progress Indicators

**Files**: `/src/app/request/new/page.tsx`, `/src/app/request/pickup-slot/page.tsx`, `/src/app/request/summary/page.tsx`

- Import and use `Progress` component from `@/components/ui/progress`
- Remove hardcoded progress bar HTML
- Use proper progress values (33%, 66%, 100%)
- **Reference**: See implementation in `/src/app/donate/pickup-slot/page.tsx:125`

#### Task 4: Standardize Layout

**Files**: All request flow pages

- Convert to `h-dvh` layout pattern
- Add proper footer with button positioning
- Use `flex-grow overflow-y-auto` for main content
- Match exact structure from donation pages
- **Reference**: Copy layout from `/src/app/donate/manual/page.tsx:372-446`

### Phase 2: Enhanced Components (Important)

**Goal**: Upgrade form components and interactions

#### Task 5: Enhanced Form Components

**Files**: `/src/app/request/new/page.tsx`

- Replace basic allergen handling with `AllergensDropdown` component
- Import from `@/components/ui/AllergensDropdown`
- Configure for request context (same allergen options)
- Remove custom allergen chip implementation
- **Reference**: See usage in `/src/app/donate/manual/page.tsx:344-351`

#### Task 6: Create TimeSlotSelector Component

**Files**: Create `/src/components/ui/TimeSlotSelector.tsx`, update request pickup-slot page

- Extract time selection logic from donation pickup-slot page
- Create reusable component with props for customization
- Support both date and time selection
- Use consistent styling (popovers, calendars, time options)
- **Reference**: Extract from `/src/app/donate/pickup-slot/page.tsx:163-264`

#### Task 7: Improve Button Styling

**Files**: All request flow pages

- Replace `bg-green-400` buttons with consistent styling
- Remove `rounded-full` - use standard button radius
- Apply theme button variants
- Match disabled states and loading states
- **Reference**: Button styling from `/src/app/donate/manual/page.tsx:418-428`

### Phase 3: Polish & Features (Nice to Have)

**Goal**: Complete feature parity

#### Task 8: Add Translation Support

**Files**: All request flow pages

- Import `useLanguage` hook
- Replace hardcoded English strings with `t()` calls
- Add missing translation keys to `/src/lib/translations.ts`
- Test Finnish language switching
- **Reference**: Translation implementation in `/src/app/feed/page.tsx`

#### Task 9: Create SummaryCard Component

**Files**: Create `/src/components/ui/SummaryCard.tsx`, update request summary page

- Build reusable component for key-value display
- Support allergen chips display
- Consistent styling with donation summary
- **Reference**: Summary styling from `/src/app/donate/summary/page.tsx:124-155`

#### Task 10: Final QA Review

**Files**: All request flow pages

- Test complete user journey
- Verify visual consistency with donation flow
- Check responsive design
- Validate translation support
- Test form validation and error states

## Quality Standards

### Visual Consistency Checklist

- [ ] Same navigation component and behavior
- [ ] Identical color palette and theming
- [ ] Consistent spacing and typography
- [ ] Matching button styles and states
- [ ] Same card/container styling
- [ ] Unified progress indication

### Component Standards

- [ ] Reuse existing UI components where possible
- [ ] Follow established patterns from donation flow
- [ ] Maintain accessibility standards
- [ ] Support translation system
- [ ] Handle loading and error states

### Code Quality

- [ ] Consistent imports and component structure
- [ ] Remove duplicate code through shared components
- [ ] Follow established naming conventions
- [ ] Add proper TypeScript types
- [ ] Include proper error handling

## Implementation Notes

### Before Starting Each Task:

1. Study the reference file(s) mentioned in the task
2. Understand the exact pattern/component being used
3. Plan minimal changes to achieve consistency
4. Test the change before marking complete

### When Marking Tasks Complete:

1. Verify the change matches the reference implementation
2. Test the functionality works correctly
3. Check responsive design on mobile
4. Confirm no regressions introduced
5. Mark task as completed only when fully done

### Senior Review Process:

After marking each task complete, the senior developer will:

1. Review code changes for accuracy
2. Test functionality and visual consistency
3. Provide feedback or approve
4. Guide next steps if issues found

## Success Criteria

The receiver flow should be **visually indistinguishable** from the donor flow in terms of:

- Navigation experience
- Visual design and theming
- Component quality and polish
- User interaction patterns
- Overall professional appearance

The end user should feel they are using the same cohesive application throughout both donation and request journeys.
