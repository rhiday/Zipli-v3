# Design System Rollout Plan

## 🎯 **Goal**: Migrate entire app to use design system without breaking anything

## 📋 **Phase-by-Phase Migration Strategy**

### **Phase 1: Foundation Setup** ✅ (Current)

- [x] Create design tokens (`design-tokens.ts`)
- [x] Create component utilities (`component-utils.ts`)
- [x] Create UI guidelines (`ui-guidelines.md`)
- [x] Create validation helpers (`ui-test-helper.ts`)

### **Phase 2: Core Components Migration** (Next)

**Priority Order**: Most reused components first

#### 2.1 Button Component (HIGH IMPACT)

- [ ] Audit current Button usage: `rg "Button|button" --type tsx`
- [ ] Update Button component to use `buildButtonClasses`
- [ ] Test all button variations
- [ ] Deploy and verify production

#### 2.2 Input/Form Components (HIGH IMPACT)

- [ ] Audit Input components
- [ ] Update to use `buildInputClasses`
- [ ] Test all form pages
- [ ] Deploy and verify

#### 2.3 Card Components (MEDIUM IMPACT)

- [ ] Audit card-like components
- [ ] Update to use `buildCardClasses`
- [ ] Test dashboard and listing pages
- [ ] Deploy and verify

### **Phase 3: Layout Components** (Week 2)

#### 3.1 Navigation Components

- [ ] BottomNav - already good, minor updates
- [ ] Header components
- [ ] Secondary navigation

#### 3.2 Page Layouts

- [ ] Dashboard layouts
- [ ] Form page layouts
- [ ] Feed/listing layouts

### **Phase 4: Content Components** (Week 3)

#### 4.1 Data Display

- [ ] DonationCard
- [ ] SummaryCard
- [ ] Charts and graphs

#### 4.2 Interactive Elements

- [ ] TimeSlotSelector
- [ ] Language switcher
- [ ] Dropdowns and modals

### **Phase 5: Pages & Flows** (Week 4)

#### 5.1 Critical User Flows

- [ ] Login/Register flow
- [ ] Donation creation flow
- [ ] Request creation flow

#### 5.2 Secondary Pages

- [ ] Profile pages
- [ ] Settings pages
- [ ] Admin pages

## 🔄 **Safe Migration Process for Each Component**

### Step 1: Audit & Plan

```bash
# Find all usages
rg "ComponentName" --type tsx -A 2 -B 2

# Check current styling patterns
rg "className.*ComponentName" --type tsx
```

### Step 2: Create Migration Branch

```bash
git checkout -b migrate/component-name
```

### Step 3: Update Component (Non-Breaking)

```tsx
// OLD - Don't remove yet
const oldButtonClasses = 'bg-green-500 text-white px-4 py-2 rounded';

// NEW - Add alongside
const newButtonClasses = buildButtonClasses('primary', 'md');

// Use feature flag approach
const useDesignSystem = process.env.NODE_ENV === 'development';
const classes = useDesignSystem ? newButtonClasses : oldButtonClasses;
```

### Step 4: Test Thoroughly

- [ ] Component works in isolation
- [ ] All pages using component still work
- [ ] Mobile responsive
- [ ] Finnish/English switching
- [ ] All user roles
- [ ] Build succeeds

### Step 5: Gradual Rollout

```tsx
// Week 1: Dev only
const useNewStyles = process.env.NODE_ENV === 'development';

// Week 2: Enable for specific pages
const useNewStyles = pathname.includes('/donate/new');

// Week 3: Enable everywhere
const useNewStyles = true;
```

### Step 6: Remove Old Code

Only after 100% confidence, remove old implementation.

## ⚠️ **Risk Mitigation Strategies**

### 1. **Feature Flags**

```tsx
const DESIGN_SYSTEM_ENABLED = {
  buttons: process.env.ENABLE_DS_BUTTONS === 'true',
  cards: process.env.ENABLE_DS_CARDS === 'true',
  inputs: process.env.ENABLE_DS_INPUTS === 'true',
};
```

### 2. **Rollback Plan**

```bash
# Always have rollback ready
git tag "pre-migration-$(date +%Y%m%d)"

# If issues occur
git revert HEAD
git push origin main
```

### 3. **Monitoring**

- Check Vercel deployment logs
- Monitor for console errors
- Test critical user journeys
- Have quick rollback process ready

### 4. **Gradual Deployment**

```bash
# Deploy to preview first
vercel

# Test preview thoroughly
# Only then deploy to production
vercel --prod
```

## 📊 **Progress Tracking**

### Components Migration Status

- [ ] Button (0/5 variations)
- [ ] Input (0/3 types)
- [ ] Card (0/4 variations)
- [ ] Navigation (0/2 components)
- [ ] Layout (0/6 containers)

### Pages Migration Status

- [ ] Login/Register (0/4 pages)
- [ ] Donation Flow (0/5 pages)
- [ ] Request Flow (0/4 pages)
- [ ] Dashboard (0/3 variations)
- [ ] Profile (0/2 pages)

## 🚨 **Emergency Procedures**

### If Something Breaks:

1. **Immediate**: Revert last commit
2. **Short-term**: Disable design system for that component
3. **Fix**: Identify and resolve issue in dev
4. **Re-deploy**: Test thoroughly before re-enabling

### Critical Path Protection:

- Always test login flow
- Always test donation creation
- Always test request creation
- Always test navigation

## 📈 **Success Metrics**

### Technical

- [ ] Zero breaking changes during migration
- [ ] All builds succeed
- [ ] No new console errors
- [ ] Performance maintained/improved

### User Experience

- [ ] UI remains visually consistent
- [ ] All functionality works
- [ ] Mobile experience unchanged
- [ ] Accessibility maintained

### Developer Experience

- [ ] Easier to make UI changes
- [ ] Fewer style inconsistencies
- [ ] Faster component development
- [ ] Better code maintainability

## 🎯 **Next Steps**

1. **This Week**: Commit foundation tools
2. **Next**: Start with Button component migration
3. **Track Progress**: Update this document weekly
4. **Review**: Weekly design system review meetings

---

**Remember**: Slow and steady wins. Better to take 4 weeks with zero breakage than 1 week with multiple production issues! 🐢✨
