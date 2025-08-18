-- Ensure schema consistency for production
-- This migration verifies all required columns exist

-- Add pickup_slots and notes to donations if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'donations' AND column_name = 'pickup_slots') THEN
    ALTER TABLE donations ADD COLUMN pickup_slots jsonb DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'donations' AND column_name = 'notes') THEN
    ALTER TABLE donations ADD COLUMN notes text;
  END IF;
END $$;

-- Create views for city analytics if they don't exist
CREATE OR REPLACE VIEW city_donation_stats AS
SELECT 
  COUNT(*) as total_donations,
  COUNT(*) FILTER (WHERE status = 'available') as available_donations,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_donations,
  SUM(quantity) as total_kg_donated,
  COUNT(DISTINCT donor_id) as active_donors,
  TO_CHAR(created_at, 'YYYY-MM') as month
FROM donations
GROUP BY TO_CHAR(created_at, 'YYYY-MM');

CREATE OR REPLACE VIEW city_request_stats AS
SELECT 
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE status = 'active') as active_requests,
  COUNT(*) FILTER (WHERE status = 'fulfilled') as fulfilled_requests,
  SUM(people_count) as people_served,
  COUNT(DISTINCT user_id) as active_receivers,
  TO_CHAR(created_at, 'YYYY-MM') as month
FROM requests
GROUP BY TO_CHAR(created_at, 'YYYY-MM');

CREATE OR REPLACE VIEW partner_organizations AS
SELECT 
  p.id,
  p.full_name,
  p.organization_name,
  p.role,
  COUNT(d.id) as donation_count,
  SUM(d.quantity) as total_kg_donated,
  MAX(d.created_at) as last_donation_date
FROM profiles p
LEFT JOIN donations d ON p.id = d.donor_id
WHERE p.role IN ('food_donor', 'food_receiver')
GROUP BY p.id, p.full_name, p.organization_name, p.role;

-- Ensure RLS is enabled on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_claims ENABLE ROW LEVEL SECURITY;