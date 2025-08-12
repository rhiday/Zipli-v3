# Zipli UI Development Guidelines

## 🚨 **CRITICAL RULES - NEVER BREAK THESE**

### 1. **Use Design Tokens Only**
```tsx
// ❌ NEVER DO THIS
<button className="bg-green-500 text-white rounded-xl">

// ✅ ALWAYS DO THIS  
<button className="bg-lime text-primary rounded-md">
```

### 2. **Reuse Existing Components**
Before creating new components, check if these exist:
- `Button` - All button variants
- `Card` - Container layouts
- `Input` - Form inputs
- `TimeSlotSelector` - Date/time selection
- `BottomNav` - Navigation
- `Header` - Page headers

### 3. **Component Modification Protocol**
When modifying existing components:

**STEP 1: Check Usage**
```bash
# Find all usages before changing
rg "ComponentName" --type tsx
```

**STEP 2: Make Changes Backwards Compatible**
```tsx
// ✅ Add new props, don't remove existing ones
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary'; // Add new variant
  size?: 'sm' | 'md' | 'lg';
  // Don't remove existing props!
}
```

**STEP 3: Test All Usages**
- Check every page that uses the component
- Test in both Finnish and English
- Test different user roles

## 🎨 **UI Consistency Rules**

### Colors
- **Primary Actions**: `bg-lime` (green buttons)
- **Secondary Actions**: `bg-base border-border` (white buttons)
- **Destructive**: `bg-negative` (red buttons)
- **Text**: `text-primary` (dark green)
- **Backgrounds**: `bg-base` (white) or `bg-cream` (off-white)

### Spacing
- **Page Padding**: `p-4`
- **Card Padding**: `p-6` (large) or `p-4` (medium)
- **Button Padding**: `px-6 py-3` (large) or `px-4 py-2` (medium)
- **Gaps**: `gap-2` (small), `gap-4` (medium), `gap-6` (large)

### Typography
- **Headings**: `text-titleSm` or `text-titleMd` with `font-semibold`
- **Body Text**: `text-body` or `text-bodyLg`
- **Labels**: `text-label` with `font-medium`

### Borders & Radius
- **Cards**: `rounded-lg` (24px)
- **Buttons/Inputs**: `rounded-md` (12px)
- **Small Elements**: `rounded-sm` (6px)

## 🔒 **Change Management Process**

### For Small Changes (colors, spacing, text)
1. Make change in ONE component
2. Test that specific component thoroughly
3. Commit with clear message: `fix(Button): adjust padding for better touch targets`

### For Medium Changes (new variants, props)
1. Add new functionality without removing old
2. Test backwards compatibility
3. Update this style guide
4. Commit: `feat(Button): add tertiary variant`

### For Large Changes (component restructure)
1. **STOP** - Discuss with team first
2. Create new component alongside old one
3. Migrate usage page by page
4. Remove old component only when all migrated
5. Multiple commits with clear migration plan

## 🧪 **Testing Checklist**

Before ANY UI change:
- [ ] Component works in isolation
- [ ] Works on mobile viewport (375px wide)
- [ ] Works in both Finnish and English
- [ ] Works for all user roles (donor, receiver, city, terminal)
- [ ] No console errors
- [ ] Maintains accessibility (keyboard nav, screen readers)
- [ ] Consistent with design system

## 🚫 **Common Mistakes to Avoid**

1. **Magic Numbers**: Never use arbitrary values like `w-[345px]`
2. **Color Mixing**: Don't mix design system colors with arbitrary ones
3. **Inconsistent Spacing**: Stick to spacing scale (2, 4, 6, 8, 12, 16, 24)
4. **Breaking Changes**: Don't modify component APIs without migration plan
5. **Missing Translations**: All new text must have Finnish translations
6. **Accessibility**: Don't remove focus states or keyboard navigation

## 📋 **Pre-Deployment Checklist**

- [ ] All pages load without errors
- [ ] Navigation works in both languages
- [ ] Forms submit correctly
- [ ] Mobile responsive
- [ ] No TypeScript errors
- [ ] Build succeeds (`pnpm build`)