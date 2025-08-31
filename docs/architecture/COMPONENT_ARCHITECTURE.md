# Component Architecture Guide

## 🏗️ Zipli Component Architecture - Post Supabase Migration

Complete guide to the component architecture after the successful migration to Supabase, including store integration patterns, component organization, and development workflows.

---

## 📋 Architecture Overview

### Migration Status ✅ COMPLETE

- **30+ components migrated** to new Supabase store
- **Unified import pattern** from `@/store`
- **Type-safe operations** throughout the application
- **Real-time data integration** in all components
- **Authentication flow** fully integrated

### Core Principles

1. **Single Source of Truth**: Unified Supabase store manages all state
2. **Type Safety**: TypeScript types generated from database schema
3. **Real-time Updates**: Components automatically receive live data
4. **Role-based Access**: Authentication and authorization built-in
5. **Consistent Patterns**: Standardized component integration

---

## 🗄️ Store Architecture

### Unified Store Pattern

```tsx
// ✅ ALL components now use this pattern
import { useDatabase } from '@/store';

// ❌ Deprecated pattern (no longer used)
import { useDatabase } from '@/store/databaseStore';
```

### Store Structure

```
src/store/
├── index.ts                    # Central exports and re-exports
├── supabaseDatabaseStore.ts    # Main Supabase store implementation
├── donation.ts                 # Donation flow state management
└── request.ts                  # Request flow state management
```

### Store Interface

```tsx
interface DatabaseStore {
  // Authentication State
  currentUser: User | null;
  isInitialized: boolean;

  // Data Collections (Real-time)
  users: User[];
  donations: Donation[];
  requests: Request[];
  foodItems: FoodItem[];

  // Authentication Operations
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  register: (userData: SignUpData) => Promise<AuthResponse>;

  // CRUD Operations (Type-safe)
  addDonation: (
    donation: CreateDonationData
  ) => Promise<DatabaseResponse<Donation>>;
  updateDonation: (
    id: string,
    updates: Partial<Donation>
  ) => Promise<DatabaseResponse<Donation>>;
  deleteDonation: (id: string) => Promise<DatabaseResponse<void>>;

  addRequest: (
    request: CreateRequestData
  ) => Promise<DatabaseResponse<Request>>;
  updateRequest: (
    id: string,
    updates: Partial<Request>
  ) => Promise<DatabaseResponse<Request>>;

  // Helper Functions
  getDonationsByDonor: (donorId: string) => DonationWithFoodItem[];
  getRequestById: (requestId: string) => Request | null;
  getAllDonations: () => Donation[];
  getAllRequests: () => Request[];

  // Real-time Subscriptions (Automatic)
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
}
```

---

## 🧩 Component Categories

### 1. Authentication Components ✅

**Location**: `src/components/auth/`, `src/app/auth/`

#### AuthProvider (`src/components/auth/AuthProvider.tsx`)

```tsx
import { useDatabase } from '@/store';
import type { User } from '@/store';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isInitialized } = useDatabase();

  // Automatic authentication state management
  // Real-time user profile updates
  // Role-based access control
};
```

#### Login/Register Pages

- `src/app/auth/login/page.tsx` ✅
- `src/app/auth/register/page.tsx` ✅
- `src/app/auth/forgot-password/page.tsx` ✅
- `src/app/auth/reset-password/page.tsx` ✅

**Integration Pattern**:

```tsx
const LoginPage = () => {
  const { login, currentUser } = useDatabase();

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.data?.user) {
      // Automatic redirect based on role
      // Real-time data subscription activated
    }
  };
};
```

### 2. Navigation Components ✅

**Location**: `src/components/layout/`, `src/components/`

#### Header Component (`src/components/layout/Header.tsx`)

```tsx
import { useDatabase } from '@/store';

const Header = ({ title }: HeaderProps) => {
  const { currentUser, isInitialized, donations, foodItems, getAllRequests } =
    useDatabase();

  // Real-time activity feed based on user role
  // Dynamic title based on user context
  // Role-specific activity items
};
```

#### Bottom Navigation (`src/components/BottomNav.tsx`)

```tsx
const BottomNav = () => {
  const { currentUser } = useDatabase();

  // Role-based navigation items
  // Dynamic routing based on user permissions
};
```

#### App Shell (`src/components/AppShell.tsx`)

```tsx
const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { isInitialized } = useDatabase();

  // Initialization state management
  // Global loading states
  // Authentication guard
};
```

### 3. Dashboard Components ✅

**Location**: `src/app/[role]/dashboard/`

#### Donor Dashboard (`src/app/donate/page.tsx`)

```tsx
const DonorDashboard = () => {
  const { currentUser, donations, getAllDonations, isInitialized } =
    useDatabase();

  // Real-time donations list
  // Dashboard statistics
  // Quick actions for donors
};
```

#### Receiver Dashboard (`src/app/receiver/dashboard/page.tsx`)

```tsx
const ReceiverDashboard = () => {
  const { currentUser, getAllRequests } = useDatabase();

  // Real-time requests management
  // Impact statistics
  // Helper organizations display
};
```

#### City Dashboard (`src/app/dashboard/city/page.tsx`)

```tsx
const CityDashboard = () => {
  const { currentUser, getAllDonations, getAllRequests } = useDatabase();

  // City-wide analytics
  // System overview
  // Administrative controls
};
```

### 4. Donation Flow Components ✅

**Location**: `src/app/donate/`

#### Manual Donation (`src/app/donate/manual/page.tsx`)

```tsx
const ManualDonationPage = () => {
  const { addDonation, foodItems, currentUser } = useDatabase();

  const handleSubmit = async (donationData: CreateDonationData) => {
    const result = await addDonation({
      ...donationData,
      donor_id: currentUser.id,
    });

    if (result.data) {
      // Real-time update to all subscribers
      // Automatic navigation to summary
    }
  };
};
```

#### Donation Summary (`src/app/donate/summary/page.tsx`)

```tsx
const DonationSummary = () => {
  const { currentUser, updateUser } = useDatabase();

  // Profile integration for address/instructions
  // Final donation confirmation
  // User profile updates
};
```

#### Pickup Slot Selection (`src/app/donate/pickup-slot/page.tsx`)

```tsx
const PickupSlotPage = () => {
  // Time slot management
  // Calendar integration
  // Availability checking
};
```

#### Donation Detail (`src/app/donate/detail/[id]/page.tsx`)

```tsx
const DonationDetailPage = ({ params }: { params: { id: string } }) => {
  const { donations, foodItems, users, deleteDonation, currentUser } =
    useDatabase();

  // Real-time donation details
  // Owner vs viewer permissions
  // Related donations by same donor
};
```

### 5. Request Flow Components ✅

**Location**: `src/app/request/`

#### Request Creation (`src/app/request/page.tsx`)

```tsx
const RequestsPage = () => {
  const { isInitialized, getAllRequests, users } = useDatabase();

  // All requests display
  // Search and filtering
  // Request status management
};
```

#### Request Detail (`src/app/request/[id]/page.tsx`)

```tsx
const RequestDetailPage = ({ params }: { params: { id: string } }) => {
  const { currentUser, getRequestById, updateRequest, users } = useDatabase();

  // Request details with real-time updates
  // Status management (owner vs viewer)
  // Contact functionality
};
```

#### Request Summary (`src/app/request/summary/page.tsx`)

```tsx
const RequestSummaryPage = () => {
  const { currentUser, addRequest } = useDatabase();

  const handleSubmitRequest = async () => {
    const result = await addRequest(requestPayload);
    // Real-time request creation
    // Automatic matching system ready
  };
};
```

#### Pickup Slot for Requests (`src/app/request/pickup-slot/page.tsx`)

```tsx
const PickupSlotPage = () => {
  const { currentUser, addRequest } = useDatabase();

  // Time slot selection for requests
  // Integration with request flow store
};
```

### 6. Feed & Marketplace Components ✅

**Location**: `src/app/feed/`, `src/components/donations/`

#### Feed Page (`src/app/feed/page.tsx`)

```tsx
const FeedPage = () => {
  const { currentUser, donations, foodItems, users, isInitialized } =
    useDatabase();

  // Real-time donations marketplace
  // Search and filtering
  // Role-based view differences
};
```

#### Donation Card (`src/components/donations/DonationCard.tsx`)

```tsx
import { DonationWithFoodItem, useDatabase } from '@/store';

interface DonationCardProps {
  donation: DonationWithFoodItem;
  donorName?: string;
  pickupTime?: string;
}

const DonationCard = ({
  donation,
  donorName,
  pickupTime,
}: DonationCardProps) => {
  const { currentUser } = useDatabase();

  // Real-time donation data display
  // Role-based action buttons
  // Navigation integration
};
```

### 7. Profile Components ✅

**Location**: `src/app/profile/`

#### Profile Page (`src/app/profile/page.tsx`)

```tsx
const ProfilePage = () => {
  const { currentUser, updateUser, logout } = useDatabase();

  // User profile management
  // Real-time profile updates
  // Account settings
};
```

#### Donor Profile View (`src/app/profile/[id]/page.tsx`)

```tsx
const DonorProfilePage = () => {
  const { users, getDonationsByDonor } = useDatabase();

  // Public donor profile
  // Donation history display
  // Trust and reputation indicators
};
```

### 8. Development Components ✅

**Location**: `src/components/dev/`

#### Dev Login Switcher (`src/components/dev/DevLoginSwitcher.tsx`)

```tsx
const DevLoginSwitcher = () => {
  const { users, login, currentUser } = useDatabase();

  const handleLogin = async (user: User) => {
    const result = await login(user.email, 'password');
    // Quick development user switching
    // Real authentication with Supabase
  };
};
```

---

## 🔄 Real-time Integration Patterns

### Automatic Subscriptions

```tsx
// Store automatically handles real-time subscriptions
const Component = () => {
  const { donations, requests } = useDatabase();

  // Data is automatically updated in real-time
  // No manual subscription management needed
  // Component re-renders on data changes
};
```

### Manual Subscription Control

```tsx
// For components needing fine-grained control
const Component = () => {
  const { subscribeToUpdates, unsubscribeFromUpdates } = useDatabase();

  useEffect(() => {
    subscribeToUpdates();
    return () => unsubscribeFromUpdates();
  }, []);
};
```

### Real-time Event Handling

```tsx
// Store handles real-time events internally
const handleRealTimeUpdate = (payload: any) => {
  switch (payload.eventType) {
    case 'INSERT':
      // New donation/request created
      break;
    case 'UPDATE':
      // Existing item updated
      break;
    case 'DELETE':
      // Item removed
      break;
  }
};
```

---

## 🛡️ Authentication Integration

### Route Protection

```tsx
// Automatic authentication checking
const ProtectedPage = () => {
  const { currentUser, isInitialized } = useDatabase();

  if (!isInitialized) return <LoadingSpinner />;
  if (!currentUser) return redirect('/auth/login');

  return <PageContent />;
};
```

### Role-based Access

```tsx
const RoleBasedComponent = () => {
  const { currentUser } = useDatabase();

  if (currentUser?.role === 'food_donor') {
    return <DonorView />;
  }

  if (currentUser?.role === 'food_receiver') {
    return <ReceiverView />;
  }

  return <DefaultView />;
};
```

### Permission Checks

```tsx
const ActionButton = ({ donation }: { donation: Donation }) => {
  const { currentUser } = useDatabase();

  const canEdit = currentUser?.id === donation.donor_id;
  const canView = currentUser?.role === 'city' || canEdit;

  if (!canView) return null;

  return <Button disabled={!canEdit}>{canEdit ? 'Edit' : 'View'}</Button>;
};
```

---

## 📊 Type Safety Implementation

### Generated Types Usage

```tsx
import type {
  User,
  Donation,
  Request,
  FoodItem,
  DonationWithFoodItem,
} from '@/store';

// All operations are type-safe
const createDonation = async (data: Omit<Donation, 'id' | 'created_at'>) => {
  // TypeScript enforces correct data structure
  const result = await addDonation(data);
  return result.data; // Typed as Donation | null
};
```

### Component Props Typing

```tsx
interface DonationCardProps {
  donation: DonationWithFoodItem; // Includes joined food item data
  showActions?: boolean;
  onEdit?: (donation: Donation) => void;
}

const DonationCard = ({
  donation,
  showActions = true,
  onEdit,
}: DonationCardProps) => {
  // Full type safety throughout component
};
```

### Store Operation Types

```tsx
// Return types are fully typed
const handleCreateDonation = async () => {
  const result: DatabaseResponse<Donation> = await addDonation(donationData);

  if (result.error) {
    // Error handling with typed error
    console.error(result.error);
    return;
  }

  // result.data is typed as Donation
  console.log('Created donation:', result.data.id);
};
```

---

## 🔧 Development Patterns

### Component Initialization

```tsx
const Component = () => {
  const { isInitialized } = useDatabase();

  if (!isInitialized) {
    return <LoadingState />;
  }

  return <ComponentContent />;
};
```

### Error Handling

```tsx
const Component = () => {
  const [error, setError] = useState<string | null>(null);
  const { addDonation } = useDatabase();

  const handleSubmit = async (data: CreateDonationData) => {
    const result = await addDonation(data);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Success handling
    router.push('/donate/success');
  };
};
```

### Loading States

```tsx
const Component = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { updateDonation } = useDatabase();

  const handleUpdate = async (id: string, updates: Partial<Donation>) => {
    setIsLoading(true);
    const result = await updateDonation(id, updates);
    setIsLoading(false);

    // Handle result...
  };

  return (
    <Button disabled={isLoading}>{isLoading ? 'Updating...' : 'Update'}</Button>
  );
};
```

---

## 🧪 Testing Integration

### Component Testing with Store

```tsx
// Test setup with mocked store
import { useDatabase } from '@/store';

jest.mock('@/store', () => ({
  useDatabase: jest.fn(),
}));

const mockedUseDatabase = useDatabase as jest.MockedFunction<
  typeof useDatabase
>;

describe('DonationCard', () => {
  beforeEach(() => {
    mockedUseDatabase.mockReturnValue({
      currentUser: mockUser,
      donations: mockDonations,
      // ... other store properties
    });
  });

  test('renders donation information', () => {
    render(<DonationCard donation={mockDonation} />);
    expect(screen.getByText(mockDonation.food_item.name)).toBeInTheDocument();
  });
});
```

### Integration Testing

```tsx
// Test real store integration
describe('Donation Flow Integration', () => {
  test('creates donation and navigates to summary', async () => {
    const { addDonation } = useDatabase();

    // Mock successful creation
    const mockResult = { data: mockDonation, error: null };
    (addDonation as jest.Mock).mockResolvedValue(mockResult);

    // Test component interaction
    render(<ManualDonationPage />);

    // Fill form and submit
    await user.type(screen.getByLabelText('Quantity'), '5');
    await user.click(screen.getByText('Continue'));

    // Verify store was called correctly
    expect(addDonation).toHaveBeenCalledWith(
      expect.objectContaining({
        quantity: 5,
        donor_id: mockUser.id,
      })
    );
  });
});
```

---

## 🚀 Performance Optimizations

### Component Memoization

```tsx
import React, { memo, useMemo } from 'react';

const DonationCard = memo(({ donation, donorName }: DonationCardProps) => {
  const { currentUser } = useDatabase();

  const canEdit = useMemo(
    () => currentUser?.id === donation.donor_id,
    [currentUser?.id, donation.donor_id]
  );

  return <CardContent />;
});
```

### Selective Store Subscriptions

```tsx
// Only subscribe to needed data
const Component = () => {
  const {
    donations, // Real-time array
    currentUser, // Authentication state
    // Don't subscribe to unused data
  } = useDatabase();
};
```

### Query Optimization

```tsx
// Use helper functions for complex queries
const DonorDashboard = () => {
  const { getDonationsByDonor, currentUser } = useDatabase();

  const myDonations = useMemo(
    () => (currentUser ? getDonationsByDonor(currentUser.id) : []),
    [getDonationsByDonor, currentUser?.id]
  );
};
```

---

## 📋 Migration Checklist

### ✅ Completed Components (30+)

- [x] **Authentication**: AuthProvider, login, register, password flows
- [x] **Navigation**: Header, BottomNav, AppShell, DashboardLayout
- [x] **Dashboards**: Donor, Receiver, City dashboards
- [x] **Donation Flow**: Manual, pickup-slot, summary, detail pages
- [x] **Request Flow**: Create, pickup-slot, summary, detail pages
- [x] **Feed**: Marketplace, donation cards, search/filter
- [x] **Profile**: User profile, donor profile views
- [x] **Development**: DevLoginSwitcher for testing

### ✅ Integration Completed

- [x] **Store Pattern**: All components use `@/store` import
- [x] **Type Safety**: TypeScript types integrated throughout
- [x] **Authentication**: Supabase Auth with automatic profiles
- [x] **Real-time**: Live data updates in all components
- [x] **Security**: Role-based access control implemented

### 🔄 Next Phase (Optional)

- [ ] **Enhanced Error Handling**: More granular error states
- [ ] **Loading Optimizations**: Skeleton screens and progressive loading
- [ ] **Performance**: Advanced memoization and virtualization
- [ ] **Testing**: Comprehensive component and integration tests
- [ ] **Accessibility**: Enhanced ARIA labels and keyboard navigation

---

**Component Architecture Complete!** 🎉

All 30+ components are now successfully integrated with the Supabase store, providing real-time data, type safety, and authentication throughout the application. The architecture is production-ready and scalable for future enhancements.
