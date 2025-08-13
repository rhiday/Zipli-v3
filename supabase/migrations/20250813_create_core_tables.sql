-- =====================================================
-- ZIPLI V3 CORE TABLES MIGRATION
-- Created: 2025-01-13
-- Description: Creates core tables for Zipli food redistribution platform
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

-- User role types
CREATE TYPE user_role AS ENUM (
    'food_donor',
    'food_receiver', 
    'city',
    'terminals'
);

-- Donation status types
CREATE TYPE donation_status AS ENUM (
    'available',
    'claimed',
    'completed',
    'cancelled'
);

-- Request status types  
CREATE TYPE request_status AS ENUM (
    'active',
    'fulfilled',
    'cancelled'
);

-- Claim status types
CREATE TYPE claim_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'completed'
);

-- =====================================================
-- PROFILES TABLE
-- Extends Supabase auth.users with application-specific data
-- =====================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name TEXT NOT NULL,
    organization_name TEXT,
    contact_number TEXT,
    address TEXT,
    driver_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FOOD ITEMS TABLE
-- Catalog of food items that can be donated
-- =====================================================

CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    allergens TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_food_items_updated_at 
    BEFORE UPDATE ON food_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONATIONS TABLE
-- Food donations offered by donors
-- =====================================================

CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    status donation_status NOT NULL DEFAULT 'available',
    pickup_time TIMESTAMPTZ,
    pickup_slots JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_donations_updated_at 
    BEFORE UPDATE ON donations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- REQUESTS TABLE
-- Food requests created by receivers
-- =====================================================

CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    people_count INTEGER NOT NULL CHECK (people_count > 0),
    pickup_date DATE NOT NULL,
    pickup_start_time TIME NOT NULL,
    pickup_end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    status request_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ensure pickup_end_time is after pickup_start_time
    CONSTRAINT check_pickup_time_order CHECK (pickup_end_time > pickup_start_time)
);

CREATE TRIGGER update_requests_updated_at 
    BEFORE UPDATE ON requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DONATION CLAIMS TABLE
-- Tracks when receivers claim donations
-- =====================================================

CREATE TABLE donation_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status claim_status NOT NULL DEFAULT 'pending',
    message TEXT, -- Optional message from receiver
    claimed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    approved_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Prevent duplicate claims for the same donation
    UNIQUE(donation_id, receiver_id)
);

CREATE TRIGGER update_donation_claims_updated_at 
    BEFORE UPDATE ON donation_claims 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- Food items indexes  
CREATE INDEX idx_food_items_name ON food_items(name);
CREATE INDEX idx_food_items_created_at ON food_items(created_at);

-- Donations indexes
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_food_item_id ON donations(food_item_id);
CREATE INDEX idx_donations_pickup_time ON donations(pickup_time);
CREATE INDEX idx_donations_created_at ON donations(created_at);

-- Requests indexes
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_pickup_date ON requests(pickup_date);
CREATE INDEX idx_requests_created_at ON requests(created_at);

-- Claims indexes
CREATE INDEX idx_donation_claims_donation_id ON donation_claims(donation_id);
CREATE INDEX idx_donation_claims_receiver_id ON donation_claims(receiver_id);
CREATE INDEX idx_donation_claims_status ON donation_claims(status);
CREATE INDEX idx_donation_claims_claimed_at ON donation_claims(claimed_at);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth with application-specific data';
COMMENT ON TABLE food_items IS 'Catalog of food items available for donation';
COMMENT ON TABLE donations IS 'Food donations offered by donors';
COMMENT ON TABLE requests IS 'Food requests created by receivers';
COMMENT ON TABLE donation_claims IS 'Claims made by receivers on specific donations';

COMMENT ON COLUMN profiles.role IS 'User role in the system';
COMMENT ON COLUMN profiles.driver_instructions IS 'Special instructions for delivery drivers';
COMMENT ON COLUMN donations.pickup_slots IS 'JSON array of available pickup time slots';
COMMENT ON COLUMN donations.quantity IS 'Quantity in kilograms';
COMMENT ON COLUMN requests.people_count IS 'Number of people this request will serve';
COMMENT ON COLUMN requests.is_recurring IS 'Whether this is a recurring weekly request';
COMMENT ON COLUMN donation_claims.message IS 'Optional message from receiver when claiming';