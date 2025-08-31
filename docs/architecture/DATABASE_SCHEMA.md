# Database Schema Reference

## 🗄️ Zipli Supabase Database Schema

Complete reference for the Zipli PostgreSQL database schema with relationships, constraints, and security policies.

---

## 📊 Schema Overview

### Core Tables

- **profiles** - User profiles linked to Supabase Auth
- **food_items** - Catalog of food items available for donation
- **donations** - Food donation listings
- **requests** - Food requests from receivers
- **donation_claims** - Matching system between donations and requests

### Enum Types

- **user_role** - User role definitions
- **donation_status** - Donation lifecycle states
- **request_status** - Request lifecycle states
- **claim_status** - Claim processing states

---

## 🏗️ Table Definitions

### 1. profiles

**Purpose**: User profiles automatically created from Supabase Auth

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name TEXT NOT NULL,
    organization_name TEXT,
    email TEXT NOT NULL,
    contact_number TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

**Relationships**:

- `id` → `auth.users(id)` (Supabase Auth)
- One-to-many with `donations` (via `donor_id`)
- One-to-many with `requests` (via `user_id`)
- One-to-many with `donation_claims` (via `claimer_id`)

**Constraints**:

- Primary key on `id`
- `role` must be valid enum value
- `full_name` and `email` required
- Cascade delete from auth.users

**Indexes**:

```sql
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
```

---

### 2. food_items

**Purpose**: Catalog of food items that can be donated

```sql
CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    allergens TEXT,
    image_url TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

**Relationships**:

- One-to-many with `donations` (via `food_item_id`)

**Constraints**:

- Primary key on `id` with auto-generated UUID
- `name` required

**Indexes**:

```sql
CREATE INDEX idx_food_items_name ON food_items(name);
CREATE INDEX idx_food_items_category ON food_items(category);
```

---

### 3. donations

**Purpose**: Food donation listings created by donors

```sql
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status donation_status DEFAULT 'available',
    pickup_date DATE,
    pickup_start_time TIME,
    pickup_end_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

**Relationships**:

- `food_item_id` → `food_items(id)`
- `donor_id` → `profiles(id)`
- One-to-many with `donation_claims` (via `donation_id`)

**Constraints**:

- Primary key on `id`
- Foreign keys to `food_items` and `profiles`
- `quantity` must be positive integer
- Cascade delete from related tables

**Indexes**:

```sql
CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_pickup_date ON donations(pickup_date);
CREATE INDEX idx_donations_created_at ON donations(created_at);
```

**Triggers**:

```sql
-- Update timestamp on modification
CREATE TRIGGER set_donations_updated_at
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

### 4. requests

**Purpose**: Food requests created by receivers

```sql
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    people_count INTEGER NOT NULL CHECK (people_count > 0),
    pickup_date DATE NOT NULL,
    pickup_start_time TIME NOT NULL,
    pickup_end_time TIME NOT NULL,
    status request_status DEFAULT 'active',
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

**Relationships**:

- `user_id` → `profiles(id)`

**Constraints**:

- Primary key on `id`
- Foreign key to `profiles`
- `people_count` must be positive integer
- `description`, `pickup_date`, `pickup_start_time`, `pickup_end_time` required
- Cascade delete from profiles

**Indexes**:

```sql
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_pickup_date ON requests(pickup_date);
CREATE INDEX idx_requests_created_at ON requests(created_at);
```

**Triggers**:

```sql
-- Update timestamp on modification
CREATE TRIGGER set_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

### 5. donation_claims

**Purpose**: Matching system between donations and requests

```sql
CREATE TABLE donation_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    claimer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status claim_status DEFAULT 'pending',
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

**Relationships**:

- `donation_id` → `donations(id)`
- `claimer_id` → `profiles(id)`

**Constraints**:

- Primary key on `id`
- Foreign keys to `donations` and `profiles`
- Cascade delete from related tables
- `claimed_at` defaults to current timestamp

**Indexes**:

```sql
CREATE INDEX idx_donation_claims_donation_id ON donation_claims(donation_id);
CREATE INDEX idx_donation_claims_claimer_id ON donation_claims(claimer_id);
CREATE INDEX idx_donation_claims_status ON donation_claims(status);
CREATE INDEX idx_donation_claims_claimed_at ON donation_claims(claimed_at);
```

---

## 🏷️ Enum Types

### user_role

**Purpose**: Define user roles in the system

```sql
CREATE TYPE user_role AS ENUM (
    'food_donor',      -- Organizations/individuals donating food
    'food_receiver',   -- Organizations receiving food donations
    'city',            -- City officials managing the system
    'terminals'        -- Terminal/hub operators
);
```

**Usage**:

- `profiles.role` - User's primary role
- Determines dashboard access and permissions

### donation_status

**Purpose**: Track donation lifecycle

```sql
CREATE TYPE donation_status AS ENUM (
    'available',       -- Available for claiming
    'claimed',         -- Claimed but not yet completed
    'completed',       -- Successfully transferred
    'expired'          -- Expired/no longer available
);
```

**Usage**:

- `donations.status` - Current donation state
- Controls visibility in marketplace

### request_status

**Purpose**: Track request lifecycle

```sql
CREATE TYPE request_status AS ENUM (
    'active',          -- Actively seeking donations
    'fulfilled',       -- Successfully matched with donation
    'cancelled'        -- Cancelled by requester
);
```

**Usage**:

- `requests.status` - Current request state
- Used for matching and filtering

### claim_status

**Purpose**: Track claim processing

```sql
CREATE TYPE claim_status AS ENUM (
    'pending',         -- Claim submitted, awaiting approval
    'approved',        -- Approved by donor
    'rejected',        -- Rejected by donor
    'completed'        -- Successfully completed transfer
);
```

**Usage**:

- `donation_claims.status` - Claim processing state
- Workflow management between donors and receivers

---

## 🔐 Row Level Security (RLS)

### Security Philosophy

- **Public Discovery**: Users can discover donations and requests
- **Owner Control**: Users can only modify their own data
- **Role-based Access**: City officials have broader access for coordination
- **Audit Trail**: All operations logged with timestamps

### Helper Functions

#### auth.user_has_role(role)

```sql
CREATE OR REPLACE FUNCTION auth.user_has_role(required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### auth.get_user_profile()

```sql
CREATE OR REPLACE FUNCTION auth.get_user_profile()
RETURNS profiles AS $$
BEGIN
  RETURN (
    SELECT * FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### RLS Policies

#### profiles

```sql
-- Read: All users can see all profiles (for discovery)
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (true);

-- Update: Users can only update their own profile
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Insert: Handled by database trigger on auth.users
```

#### food_items

```sql
-- Read: All users can see food items catalog
CREATE POLICY "food_items_select_policy" ON food_items
    FOR SELECT USING (true);

-- Insert: Only authenticated users can add food items
CREATE POLICY "food_items_insert_policy" ON food_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

#### donations

```sql
-- Read: All users can see available donations
CREATE POLICY "donations_select_policy" ON donations
    FOR SELECT USING (true);

-- Insert: Only donors can create donations
CREATE POLICY "donations_insert_policy" ON donations
    FOR INSERT WITH CHECK (
        auth.user_has_role('food_donor'::user_role) AND
        auth.uid() = donor_id
    );

-- Update: Only donation owner can update
CREATE POLICY "donations_update_policy" ON donations
    FOR UPDATE USING (auth.uid() = donor_id);

-- Delete: Only donation owner or city officials can delete
CREATE POLICY "donations_delete_policy" ON donations
    FOR DELETE USING (
        auth.uid() = donor_id OR
        auth.user_has_role('city'::user_role)
    );
```

#### requests

```sql
-- Read: All users can see active requests
CREATE POLICY "requests_select_policy" ON requests
    FOR SELECT USING (true);

-- Insert: Only receivers can create requests
CREATE POLICY "requests_insert_policy" ON requests
    FOR INSERT WITH CHECK (
        auth.user_has_role('food_receiver'::user_role) AND
        auth.uid() = user_id
    );

-- Update: Only request owner can update
CREATE POLICY "requests_update_policy" ON requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Delete: Only request owner or city officials can delete
CREATE POLICY "requests_delete_policy" ON requests
    FOR DELETE USING (
        auth.uid() = user_id OR
        auth.user_has_role('city'::user_role)
    );
```

#### donation_claims

```sql
-- Read: Claimers see their claims, donors see claims for their donations
CREATE POLICY "donation_claims_select_policy" ON donation_claims
    FOR SELECT USING (
        auth.uid() = claimer_id OR
        auth.uid() = (SELECT donor_id FROM donations WHERE id = donation_id) OR
        auth.user_has_role('city'::user_role)
    );

-- Insert: Only receivers can create claims
CREATE POLICY "donation_claims_insert_policy" ON donation_claims
    FOR INSERT WITH CHECK (
        auth.user_has_role('food_receiver'::user_role) AND
        auth.uid() = claimer_id
    );

-- Update: Donors can update claims for their donations
CREATE POLICY "donation_claims_update_policy" ON donation_claims
    FOR UPDATE USING (
        auth.uid() = (SELECT donor_id FROM donations WHERE id = donation_id) OR
        auth.user_has_role('city'::user_role)
    );
```

---

## 🔄 Database Triggers

### Automatic Profile Creation

```sql
-- Create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    (new.raw_user_meta_data->>'role')::user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Updated Timestamp Maintenance

```sql
-- Generic function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to donations and requests tables
CREATE TRIGGER set_donations_updated_at
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 📈 Performance Optimizations

### Indexes Strategy

- **Primary Keys**: All tables have UUID primary keys with automatic generation
- **Foreign Keys**: Indexed for join performance
- **Query Patterns**: Indexes on commonly filtered columns (status, dates, user roles)
- **Text Search**: Indexes on name and description fields

### Query Optimization

```sql
-- Optimized donation listing query
SELECT
    d.id,
    d.quantity,
    d.status,
    d.pickup_date,
    fi.name as food_name,
    fi.description,
    fi.image_url,
    p.full_name as donor_name
FROM donations d
JOIN food_items fi ON d.food_item_id = fi.id
JOIN profiles p ON d.donor_id = p.id
WHERE d.status = 'available'
ORDER BY d.created_at DESC;

-- Uses indexes: donations(status), donations(created_at)
```

### Real-time Subscriptions

```sql
-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE donations;
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
ALTER PUBLICATION supabase_realtime ADD TABLE donation_claims;
ALTER PUBLICATION supabase_realtime ADD TABLE food_items;
```

---

## 🧪 Sample Data

### Users

```sql
-- Sample profiles for testing
INSERT INTO profiles (id, role, full_name, email, organization_name) VALUES
('11111111-1111-1111-1111-111111111111', 'food_donor', 'Hasan Donor', 'hasan@zipli.test', 'Zipli Restaurant'),
('22222222-2222-2222-2222-222222222222', 'food_receiver', 'Maria Receiver', 'maria@zipli.test', 'Red Cross Helsinki'),
('33333333-3333-3333-3333-333333333333', 'city', 'City Admin', 'city@zipli.test', 'Helsinki City'),
('44444444-4444-4444-4444-444444444444', 'terminals', 'Terminal Op', 'terminal@zipli.test', 'Helsinki Airport');
```

### Food Items

```sql
-- Sample food items catalog
INSERT INTO food_items (name, description, allergens, category) VALUES
('Fresh Bread', 'Daily baked bread from local bakery', 'Wheat, Gluten', 'Bakery'),
('Vegetable Soup', 'Hearty vegetable soup, perfect for cold days', 'None', 'Prepared Food'),
('Dairy Products', 'Milk, cheese, and yogurt close to expiry', 'Milk, Lactose', 'Dairy'),
('Fresh Produce', 'Seasonal fruits and vegetables', 'None', 'Produce');
```

---

## 🔍 Migration Queries

### Data Migration from Mock Store

```sql
-- If migrating from existing mock data
-- Example: Migrate donations
INSERT INTO donations (food_item_id, donor_id, quantity, status, pickup_date)
SELECT
    fi.id as food_item_id,
    p.id as donor_id,
    mock_data.quantity,
    mock_data.status::donation_status,
    mock_data.pickup_date::date
FROM mock_donations_table mock_data
JOIN profiles p ON p.email = mock_data.donor_email
JOIN food_items fi ON fi.name = mock_data.food_name;
```

### Schema Validation

```sql
-- Verify schema integrity
SELECT
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_type;

-- Check RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 📚 TypeScript Integration

### Generated Types

```typescript
// Generated from Supabase schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'food_donor' | 'food_receiver' | 'city' | 'terminals';
          full_name: string;
          organization_name: string | null;
          email: string;
          contact_number: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: 'food_donor' | 'food_receiver' | 'city' | 'terminals';
          full_name: string;
          organization_name?: string | null;
          email: string;
          contact_number?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'food_donor' | 'food_receiver' | 'city' | 'terminals';
          full_name?: string;
          organization_name?: string | null;
          email?: string;
          contact_number?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // ... other tables
    };
  };
}
```

### Usage in Components

```typescript
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Donation = Database['public']['Tables']['donations']['Row'];

// Type-safe database operations
const createDonation = async (
  donation: Database['public']['Tables']['donations']['Insert']
) => {
  const { data, error } = await supabase
    .from('donations')
    .insert(donation)
    .select();

  if (error) throw error;
  return data;
};
```

---

## 🛠️ Maintenance & Monitoring

### Health Checks

```sql
-- Table sizes and row counts
SELECT
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables
WHERE schemaname = 'public';

-- Index usage
SELECT
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Backup Strategy

- **Automated Backups**: Supabase automatic daily backups
- **Point-in-time Recovery**: Available for Pro plans
- **Export Options**: SQL dump or CSV export for data portability

### Monitoring Queries

```sql
-- Active real-time subscriptions
SELECT count(*) FROM pg_stat_replication;

-- Recent donations activity
SELECT
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as donations_count,
    SUM(quantity) as total_quantity
FROM donations
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
```

---

**Database Schema Complete!** This schema supports the full Zipli application with authentication, real-time features, security, and scalability for production deployment.
