-- =====================================================
-- CRITICAL PERFORMANCE INDEXES FOR 500+ USERS DEMO
-- Adds composite indexes for common query patterns
-- =====================================================

-- Donations performance indexes
CREATE INDEX IF NOT EXISTS idx_donations_donor_status_created 
  ON donations(donor_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_donations_status_pickup_time 
  ON donations(status, pickup_time_start) 
  WHERE status IN ('available', 'pending');

CREATE INDEX IF NOT EXISTS idx_donations_food_item_id 
  ON donations(food_item_id);

-- Requests performance indexes  
CREATE INDEX IF NOT EXISTS idx_requests_user_status_pickup 
  ON requests(user_id, status, pickup_date);

CREATE INDEX IF NOT EXISTS idx_requests_status_created 
  ON requests(status, created_at DESC);

-- Food items indexes
CREATE INDEX IF NOT EXISTS idx_food_items_donor_id 
  ON food_items(donor_id);

CREATE INDEX IF NOT EXISTS idx_food_items_user_id 
  ON food_items(user_id);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role 
  ON profiles(role);

CREATE INDEX IF NOT EXISTS idx_profiles_city 
  ON profiles(city) 
  WHERE city IS NOT NULL;

-- Donation claims indexes (if table exists)
CREATE INDEX IF NOT EXISTS idx_donation_claims_donation_id 
  ON donation_claims(donation_id);

CREATE INDEX IF NOT EXISTS idx_donation_claims_claimer_id 
  ON donation_claims(claimer_id);

-- Add database statistics refresh for query planning
ANALYZE;

-- Add comments for documentation
COMMENT ON INDEX idx_donations_donor_status_created IS 
  'Performance index for donor dashboard queries - prevents N+1 problems';
  
COMMENT ON INDEX idx_donations_status_pickup_time IS 
  'Performance index for available donations filtering - critical for feed';
  
COMMENT ON INDEX idx_requests_user_status_pickup IS 
  'Performance index for user request history and pickup scheduling';