# Zipli v3 - Food Donation Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frhiday%2FZipli-v3&project-name=zipli-v3&repository-name=zipli-v3)

A modern food donation platform connecting donors with recipients, built with Next.js, TypeScript, and Supabase.

## 🚀 **Professional Development Pipeline**

This project features a comprehensive deployment pipeline with automated quality gates and multi-environment deployments.

📋 **Pipeline Status**:
✅ **Zero TypeScript Errors** - Strict type checking prevents runtime issues  
✅ **Automated Deployments** - Push to deploy with quality gates  
✅ **Pre-commit Validation** - Issues caught before reaching repository  
✅ **Multi-environment Testing** - Staging and feature previews  
✅ **VS Code Integration** - Real-time error detection and auto-formatting

## 📖 **Documentation Hub**

| Guide                                                | Purpose                          | Time    |
| ---------------------------------------------------- | -------------------------------- | ------- |
| **[Development Guide](./DEVELOPMENT.md)**            | Daily development workflow       | 2 min   |
| **[Deployment Pipeline](./DEPLOYMENT_PIPELINE.md)**  | Complete setup & troubleshooting | 15 min  |
| **[Migration Guide](./PIPELINE_MIGRATION_GUIDE.md)** | Replicate pipeline elsewhere     | 3 hours |

## 🚀 **Current Status: Production-Ready Architecture**

✅ **Database Architecture**: Fully migrated to Supabase PostgreSQL  
✅ **Authentication**: Supabase Auth with automatic profile creation  
✅ **Real-time Features**: Live data updates and subscriptions  
✅ **Type Safety**: Complete TypeScript integration with zero errors  
✅ **Component Architecture**: All 30+ components using unified store  
✅ **Deployment Pipeline**: Professional CI/CD with quality gates

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Quality checks (automatic via pre-commit hooks)
npm run validate       # Run all checks
npm run type-check     # TypeScript validation
npm run lint:fix       # Fix ESLint issues
npm run format         # Format code

# Building
npm run build          # Production build
npm run build:check    # Test production build
```

### Branch Strategy & Environments

- **`main`** → Production deployment (protected)
- **`develop`** → Staging environment with preview URLs
- **`feature/*`** → Individual preview deployments

All pushes trigger automatic deployments with quality gates.

## Database Setup

The application now uses **Supabase** as the primary database. The migration includes:

### Quick Setup (For Development)

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run database migrations**:
   ```sql
   -- Copy and paste these files in Supabase SQL Editor:
   -- 1. supabase/migrations/20250813_create_core_tables.sql
   -- 2. supabase/migrations/20250813_setup_rls_policies.sql
   -- 3. supabase/migrations/20250813_auth_triggers.sql
   ```
3. **Set environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Optional, for seeding
   ```
4. **Seed with test data**:
   ```bash
   npm run seed
   ```
5. **Start development**:
   ```bash
   npm run dev
   ```

### Database Schema

- **5 core tables**: profiles, food_items, donations, requests, donation_claims
- **Row Level Security (RLS)**: Comprehensive security policies
- **Database triggers**: Automatic profile creation on user signup
- **Enum types**: Standardized role and status management
- **Real-time subscriptions**: Live data updates

### Authentication System

- **Supabase Auth**: JWT-based authentication
- **Automatic profiles**: Created via database triggers
- **Role-based access**: food_donor, food_receiver, city, terminals
- **Type-safe operations**: Full TypeScript integration

### Key Files

```
src/
├── types/supabase.ts          # Database type definitions
├── lib/auth/authService.ts    # Authentication service layer
├── store/
│   ├── index.ts               # Central store exports
│   └── supabaseDatabaseStore.ts # Main Supabase store
└── supabase/
    └── migrations/            # Database migration files
        ├── 20250813_create_core_tables.sql
        ├── 20250813_setup_rls_policies.sql
        └── 20250813_auth_triggers.sql
```

## Deployment

### Environment Variables

Add the following to your deployment platform:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: For image generation
OPENAI_API_KEY=sk-...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=donations
```

### Production Deployment

1. **Create Supabase project** for production
2. **Run migration files** in Supabase SQL Editor:
   ```sql
   -- Run these in order:
   -- 1. supabase/migrations/20250813_create_core_tables.sql
   -- 2. supabase/migrations/20250813_setup_rls_policies.sql
   -- 3. supabase/migrations/20250813_auth_triggers.sql
   ```
3. **Seed with production data**:
   ```bash
   npm run seed  # Creates test users and food items
   ```
4. **Deploy to Vercel** with environment variables

## Test Accounts

For development testing with mock data, use these credentials (password: 'password'):

- **Donor**: `hasan@zipli.test` (Food Donor)
- **Receiver**: `maria@zipli.test` (Food Receiver)
- **City Admin**: `city@zipli.test` (City Official)
- **Terminal**: `terminal@zipli.test` (Terminal Operator)

## Architecture Overview

### Store Architecture

The application now uses a **unified Supabase store** that provides:

- **Type-safe database operations** via generated types
- **Real-time subscriptions** for live updates
- **Optimistic updates** for better UX
- **Automatic caching** and state management
- **Row-level security** enforcement

### Component Integration

All **30+ components** have been migrated to use the new store:

```tsx
// ✅ New pattern (all components now use this)
import { useDatabase } from '@/store';

// ❌ Old pattern (deprecated)
import { useDatabase } from '@/store/databaseStore';
```

### Authentication Flow

1. **User signup/login** → Supabase Auth
2. **Profile creation** → Database trigger
3. **Role assignment** → Based on signup data
4. **Dashboard routing** → Role-based navigation

## Migration Summary

### Completed ✅

- [x] Database schema design and implementation
- [x] Supabase Auth integration with profile creation
- [x] TypeScript type generation and integration
- [x] Complete store architecture migration
- [x] All 30+ components migrated to new store
- [x] Authentication flow integration
- [x] Real-time subscriptions setup
- [x] Row Level Security policies

### Next Phase 🔄

- [ ] Production database deployment
- [ ] End-to-end testing with real Supabase
- [ ] Performance optimization and caching
- [ ] Advanced real-time features
- [ ] User onboarding and data migration

## Development Notes

### Database Operations

```tsx
// All CRUD operations are now type-safe
const {
  currentUser, // Current authenticated user
  donations, // Real-time donations list
  addDonation, // Create new donation
  updateDonation, // Update existing donation
  subscribeToUpdates, // Real-time subscriptions
} = useDatabase();
```

### Real-time Features

```tsx
// Automatic real-time updates
useEffect(() => {
  const subscription = supabase
    .channel('donations')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'donations' },
      handleRealTimeUpdate
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

## Future Plans

### Enhanced Features

- **Advanced filtering** with database indexes
- **Geolocation services** for distance-based matching
- **Push notifications** via Supabase Edge Functions
- **Analytics dashboard** with real-time metrics
- **Multi-tenant support** for different cities

### Test Automation

- Implement end-to-end (E2E) and integration tests using Playwright
- Database integration testing with test Supabase instance
- Component testing with real data flows
- Performance and load testing

## Image Generation with DALL·E

To bulk-generate images for food items using OpenAI DALL·E and upload to Supabase Storage:

1. Set up environment variables:

   ```env
   OPENAI_API_KEY=sk-...
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_URL=your-supabase-url
   SUPABASE_STORAGE_BUCKET=donations
   ```

2. Install dependencies:

   ```bash
   npm install openai @supabase/supabase-js dotenv node-fetch
   ```

3. Run the script:
   ```bash
   node scripts/generate_food_images.js
   ```

The script will:

- Skip items that already have images
- Upload to Supabase Storage `donations` bucket
- Update `image_url` field in `food_items` table

---

## 📚 Complete Documentation

### Development & Deployment

- **[Development Guide](./DEVELOPMENT.md)** - Daily development workflow
- **[Deployment Pipeline](./DEPLOYMENT_PIPELINE.md)** - Complete CI/CD setup guide
- **[Migration Guide](./PIPELINE_MIGRATION_GUIDE.md)** - Replicate pipeline in other projects

### Architecture & Database

- **[Supabase Migration Guide](./SUPABASE_MIGRATION.md)** - Database migration documentation
- **[Database Schema](./DATABASE_SCHEMA.md)** - Schema reference and types
- **[Component Architecture](./COMPONENT_ARCHITECTURE.md)** - Store integration guide

### Standards & Guidelines

- **[Claude Instructions](./CLAUDE_INSTRUCTIONS.md)** - Development guidelines
- **[Design System](./DESIGN_SYSTEM_ROLLOUT.md)** - UI standardization plan

---

**🎯 This project demonstrates production-ready development practices with automated quality assurance, type safety, and seamless deployment workflows.**
