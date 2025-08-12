# Claude Code Instructions for Zipli v3 Project

## 🎨 **MANDATORY DESIGN SYSTEM RULES**

### **BEFORE ANY UI CHANGE - ALWAYS:**

1. **Use Design System First**
   ```tsx
   // ❌ NEVER DO THIS
   className="bg-green-500 text-white px-4 py-2 rounded-xl"
   
   // ✅ ALWAYS DO THIS  
   import { buildButtonClasses } from '@/lib/component-utils';
   className={buildButtonClasses('primary', 'md')}
   ```

2. **Import Design Tokens**
   ```tsx
   import { COLORS, RADIUS, COMPONENT_PATTERNS } from '@/lib/design-tokens';
   
   // Use tokens instead of hardcoded values
   className={`bg-${COLORS.lime} rounded-${RADIUS.md}`}
   ```

3. **Check Existing Components First**
   ```bash
   # Before creating new components, search for existing ones:
   rg "Button|Card|Input|TimeSlot" --type tsx
   ```

### **UI CHANGE PROTOCOL - MANDATORY STEPS:**

#### Step 1: Audit Current Usage
```bash
rg "ComponentName" --type tsx -A 2 -B 2
```

#### Step 2: Use Component Utilities
```tsx
import { 
  buildButtonClasses, 
  buildCardClasses, 
  buildInputClasses,
  layoutClasses,
  textClasses 
} from '@/lib/component-utils';
```

#### Step 3: Validate Changes
```tsx
import { validateComponent } from '@/lib/ui-test-helper';

// Before committing, run:
validateComponent(componentCode, 'ComponentName');
```

#### Step 4: Test Checklist
- [ ] Mobile responsive (375px width)
- [ ] Works in Finnish and English
- [ ] All user roles work
- [ ] No console errors
- [ ] Build succeeds (`pnpm build`)

### **FORBIDDEN ACTIONS:**
- ❌ No arbitrary values: `w-[345px]`, `bg-[#ff0000]`
- ❌ No hardcoded colors outside design system
- ❌ No magic numbers for spacing/sizing
- ❌ No removing existing component props without migration
- ❌ No hardcoded English text without translations

### **REQUIRED IMPORTS FOR UI WORK:**
```tsx
// Always import these for UI changes
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  buildButtonClasses,
  buildCardClasses, 
  buildInputClasses,
  textClasses,
  layoutClasses 
} from '@/lib/component-utils';
import { COLORS, RADIUS } from '@/lib/design-tokens';
```

## 🔄 **SAFE CHANGE METHODOLOGY**

### For Small Changes (text, spacing, colors):
1. Use design tokens only
2. Test component in isolation
3. Check 2-3 pages that use it
4. Commit with clear message
5. Deploy and verify

### For Medium Changes (new props, variants):
1. Add new functionality without removing old
2. Use feature flags if needed
3. Test backwards compatibility
4. Update documentation
5. Gradual rollout

### For Large Changes (component restructure):
1. **STOP** - Create plan first
2. Create new component alongside old
3. Migrate usage page by page
4. Track migration progress
5. Remove old only when 100% migrated

## 📋 **COMPONENT CREATION RULES**

### New Component Checklist:
- [ ] Uses design system tokens
- [ ] Supports all necessary variants
- [ ] Has proper TypeScript interfaces
- [ ] Includes focus states for accessibility
- [ ] Works with translations
- [ ] Mobile responsive
- [ ] Consistent with existing patterns

### Component Template:
```tsx
import { cn } from '@/lib/utils';
import { buildButtonClasses } from '@/lib/component-utils';
import { useLanguage } from '@/hooks/useLanguage';

interface ComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export function Component({ 
  variant = 'primary',
  size = 'md', 
  className,
  children 
}: ComponentProps) {
  const { t } = useLanguage();
  
  return (
    <div className={cn(
      buildButtonClasses(variant, size),
      className
    )}>
      {children}
    </div>
  );
}
```

## 🚨 **EMERGENCY ROLLBACK PROCESS**

If UI changes break something:

1. **Immediate**: 
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Investigation**:
   - Check Vercel deployment logs
   - Test locally to reproduce issue
   - Identify root cause

3. **Fix**:
   - Create fix in development
   - Test thoroughly
   - Deploy fix

## 📊 **PROGRESS TRACKING**

When making UI changes, update progress in `DESIGN_SYSTEM_ROLLOUT.md`:
- Mark components as migrated
- Note any issues encountered
- Document decisions made

## 🎯 **PRIORITY ORDER FOR CHANGES**

1. **High Impact**: Button, Input, Card components
2. **Medium Impact**: Navigation, Layout components  
3. **Low Impact**: Content, Display components

## 💬 **COMMUNICATION RULES**

### Commit Messages:
```bash
# For design system changes
feat(Button): migrate to design system utilities
fix(Card): use consistent border radius from design tokens
refactor(Input): remove arbitrary values, use design system

# For regular UI changes  
fix(DonationCard): adjust spacing using design tokens
feat(TimeSlot): add variant using component utilities
```

### Before Large Changes:
- Document the plan in `DESIGN_SYSTEM_ROLLOUT.md`
- Create clear migration strategy
- Identify rollback points

---

## 🔧 **DEVELOPMENT WORKFLOW**

1. **Start**: Check design system guidelines
2. **Code**: Use component utilities and design tokens
3. **Test**: Run validation helpers
4. **Commit**: Clear, descriptive messages
5. **Deploy**: Gradual rollout with monitoring
6. **Verify**: Test production thoroughly

**Remember**: Consistency and safety over speed. Every UI change should make the system more consistent, not less! 🎨✨