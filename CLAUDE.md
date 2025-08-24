# Claude Code Context Preservation

## Project Overview

Zipli is a food donation platform connecting donors and receivers to reduce waste. Built with Next.js 14, TypeScript, Supabase, and Zustand state management.

## Key Architecture

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand with persistence
- **UI Components**: Radix UI + shadcn/ui
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel

## Critical Commands

```bash
# Development
npm run dev

# Type checking and linting
npm run type-check
npm run lint
npm run lint:fix

# Testing
npm run test
npm run test:coverage

# Build and deploy
npm run build
npm run validate
```

## Current User Roles & Flows

1. **Donors**: Create food donations, manage listings
2. **Receivers**: Browse and request food items
3. **City Coordinators**: Oversee local operations

## Recent Major Fixes Applied

- ✅ Fixed navigation glitches between summary and thank you pages
- ✅ Fixed critical ErrorBoundary component with malformed JSX
- ✅ Fixed UI consistency issues (title="Default" placeholders)
- ✅ Fixed authentication routing problems
- ✅ Added proper state cleanup and session management

## Current Enhancement Focus

**YC Demo Readiness** - Implementing comprehensive error handling, edge case mitigation, and investor-ready stability improvements.

### Progress Status (Feature Branch: feature/yc-ready-enhancements)

- ✅ **Phase 1: Setup & Documentation** (COMPLETED)
  - Created feature branch `feature/yc-ready-enhancements`
  - Set up Claude Code context preservation system (CLAUDE.md)
  - Documented project architecture and critical commands

- 🔄 **Phase 2: Toast Notification System** (IN PROGRESS)
  - Analyzed existing codebase - no toast system currently exists
  - Identified design system tokens from tailwind.config.js
  - Next: Create toast provider with Zipli brand consistency
- ⏳ **Phase 3: Edge Case Mitigation** (PENDING)
  - 10 critical edge cases identified and documented
  - Implementation pending after toast system completion
- ⏳ **Phase 4: Testing & Validation** (PENDING)
  - Comprehensive testing planned after core implementations

## Key Files & Components

- `/src/app/layout.tsx` - Root layout with fonts and error boundary
- `/src/store/` - Zustand stores for state management
- `/src/components/` - Reusable UI components
- `/src/lib/validation.ts` - Zod schemas and validation
- `/src/lib/supabase/` - Database client and utilities

## Translation System

- **Library**: Custom i18n with JSON files in `/public/locales/`
- **Languages**: EN (primary), FR, ES planned
- **Usage**: `useTranslation()` hook, `t('key')` function

## Testing Strategy

- Unit tests with Jest
- Integration tests with React Testing Library
- E2E tests planned with Playwright

## Design System

- **Fonts**: Manrope (body), Space Grotesk (display)
- **Colors**: Zipli brand colors with semantic tokens
  - Primary: `#021d13` (dark green)
  - Earth: `#024209` (interactive green)
  - Lime: `#18e170` (positive accent)
  - Cream: `#f5f9ef` (light background)
  - Positive: `#a6f175` (success states)
  - Negative: `#cb0003` (error states)
- **Border Radius**: xs(3px), sm(6px), md(12px), lg(24px)
- **Components**: Radix primitives + custom styling

## Edge Case Priorities & Mitigation Plans

### 1. Network interruption during form submission

**Risk**: Lost donation/request data, frustrated users
**Solution**:

- Auto-save form data to localStorage every 30s
- Retry mechanism with exponential backoff
- Toast notification: "Connection lost, retrying..."
- Resume from saved state when network returns

### 2. Duplicate pickup scheduling conflicts

**Risk**: Multiple receivers scheduling same donation pickup
**Solution**:

- Real-time pickup slot locking via Supabase subscriptions
- Toast notification: "This time slot just became unavailable"
- Auto-refresh available slots every 10s
- Optimistic UI with rollback on conflict

### 3. Translation key failures and fallbacks

**Risk**: Broken UI with missing text, poor UX
**Solution**:

- Fallback system: missing key → English → key name display
- Toast notification for dev environment: "Missing translation: {key}"
- Graceful degradation with readable fallbacks
- Translation key validation in build process

### 4. Image upload failures with large files

**Risk**: Infinite loading, crashed uploads, poor mobile experience  
**Solution**:

- Client-side compression before upload
- Progress indicator with cancel option
- File size validation (max 5MB)
- Toast notifications: "Compressing image..." → "Upload failed, try smaller image"

### 5. Session timeout during donation process

**Risk**: Lost progress, forced re-login mid-flow
**Solution**:

- Session refresh before expiry (90% of timeout)
- Save donation state across session renewal
- Toast notification: "Refreshing session..."
- Seamless continuation after re-auth

### 6. GPS/location access denial

**Risk**: Location-dependent features broken, can't find nearby donations
**Solution**:

- Fallback to manual location entry
- City/area dropdown as backup
- Toast notification: "Location access denied - please enter your area"
- Graceful degradation with broader search radius

### 7. Multiple browser tab synchronization

**Risk**: State conflicts, duplicate submissions, data inconsistency
**Solution**:

- BroadcastChannel API for cross-tab communication
- Zustand state sync across tabs
- Toast notification: "Updated from another tab"
- Primary tab detection and delegation

### 8. Offline capability graceful degradation

**Risk**: App completely unusable without internet
**Solution**:

- Service worker for basic offline functionality
- Cached donation listings for browsing
- Queue failed requests for retry when online
- Toast notification: "You're offline - limited functionality available"

### 9. Database connection failures

**Risk**: App completely broken, no data access
**Solution**:

- Connection retry with exponential backoff
- Cached data display during outage
- Health check monitoring and alerts
- Toast notification: "Database temporarily unavailable, retrying..."

### 10. Role permission boundary violations

**Risk**: Security breaches, unauthorized access
**Solution**:

- Client-side role checking with server validation
- Graceful permission denied handling
- Automatic redirect to appropriate dashboard
- Toast notification: "Access denied - redirecting to your dashboard"

## Performance Monitoring

- Custom performance monitor in development
- Error tracking via monitoring.ts
- Health check endpoint at `/api/health`

## Security Measures

- Input validation with Zod schemas
- Rate limiting implementation
- HTML sanitization utilities
- Role-based access control
- Secure session management

## Current Session Notes

- **Branch**: `feature/yc-ready-enhancements`
- **Next Task**: Complete toast notification system implementation with design system consistency
- **Dependencies**: No existing toast system found - will create from scratch using Radix UI Toast primitive
- **Design Tokens Ready**: All color tokens and spacing available in tailwind.config.js
- **Status**: Phase 1 complete, Phase 2 in progress, ready to resume implementation

## Resume Command

```bash
git checkout feature/yc-ready-enhancements
npm run dev
# Continue with toast system implementation
```
