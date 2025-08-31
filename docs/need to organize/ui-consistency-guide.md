# UI Consistency Guide

## 🎯 Achieving 110% UI Consistency

This guide prevents accidental layout changes and ensures consistent UI patterns across Zipli components.

## 📋 Standard Layout Patterns

### Summary Page Layout Pattern

```tsx
// ✅ ALWAYS use this structure for summary pages
<PageContainer
  header={/* Navigation + Progress */}
  contentClassName="p-4 space-y-6" // NOT pb-24
  footer={/* BottomActionBar */}
  className="bg-white"
>
  {/* First Section */}
  <div className="flex flex-col gap-4">
    <h2 className="text-lg font-semibold text-[#021d13] mt-2">
      {/* First section title */}
    </h2>
    {/* Content */}
  </div>

  {/* Subsequent Sections */}
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-[#021d13] mt-6">
      {/* Section title */}
    </h2>
    {/* Content */}
  </div>
</PageContainer>
```

### Card Component Pattern

```tsx
// ✅ ALWAYS use this structure for summary cards
<div className="flex items-center justify-between p-3 rounded-[12px] bg-[#F5F9EF] border border-[#D9DBD5]">
  <span className="font-semibold text-interactive">{/* Content */}</span>
  <button
    className="flex items-center justify-center w-[42px] h-[32px] rounded-full border border-[#021d13] bg-white transition-colors hover:bg-black/5"
    aria-label="Edit"
  >
    {/* Edit icon SVG */}
  </button>
</div>
```

## 🛡️ Prevention Strategies

### 1. Component Reference System

Before creating any new component, ALWAYS check these reference components:

**Summary Pages:**

- `/src/app/donate/summary/page.tsx` (✅ REFERENCE)
- `/src/app/request/summary/page.tsx` (✅ FIXED)

**Form Pages:**

- `/src/app/donate/new/page.tsx`
- `/src/app/request/new/page.tsx`

### 2. Copy-Paste Approach

When creating similar components:

1. **Start by copying** the reference component
2. **Modify content only**, keep structure intact
3. **Double-check spacing** before committing

### 3. Standard Spacing Rules

```tsx
// ✅ CORRECT Spacing Patterns
contentClassName = 'p-4 space-y-6'; // Page content
className = 'space-y-4'; // Section spacing
className = 'mt-2'; // First section header
className = 'mt-6'; // Subsequent section headers
className = 'flex flex-col gap-4'; // First section container
className = 'space-y-4'; // Other section containers
```

```tsx
// ❌ AVOID These Patterns
contentClassName = 'p-4 space-y-6 pb-24'; // Extra padding breaks layout
className = 'space-y-2'; // Too tight spacing
className = 'space-y-8'; // Too loose spacing
```

### 4. Review Checklist

Before modifying ANY existing component, check:

- [ ] Does this component match the reference pattern?
- [ ] Are spacing classes consistent with other similar components?
- [ ] Are header margins (`mt-2` vs `mt-6`) following the pattern?
- [ ] Is the PageContainer configuration correct?
- [ ] Are card styles using the exact reference classes?

### 5. Testing Strategy

After ANY layout changes:

1. **Compare side-by-side** with reference component
2. **Check responsiveness** on different screen sizes
3. **Verify consistent spacing** throughout the flow
4. **Test with real data** to ensure layout handles content properly

## 🔧 Quick Reference Classes

### Zipli Design Tokens

```tsx
// Colors
text-[#021d13]         // Primary dark green
text-interactive       // Interactive green (#024209)
bg-[#F5F9EF]          // Light green background
border-[#D9DBD5]      // Border color

// Spacing
space-y-6             // Page-level spacing
space-y-4             // Section-level spacing
mt-2                  // First header
mt-6                  // Subsequent headers
p-3                   // Card padding
gap-4                 // Flex gap

// Borders & Radius
rounded-[12px]        // Standard card radius
border               // Standard border
```

## 🎯 Implementation Rules

1. **NEVER modify spacing** without checking the reference component
2. **ALWAYS use exact class names** from reference components
3. **CREATE new components** based on existing patterns
4. **TEST immediately** after any layout changes
5. **DOCUMENT any new patterns** in this guide

This approach ensures that accidental layout changes become impossible because we always reference proven, working patterns.
