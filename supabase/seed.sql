-- =====================================================
-- ZIPLI V3 SEED DATA
-- Created: 2025-01-13
-- Description: Seeds database with initial data for development and testing
-- =====================================================

-- Clear existing data (for re-seeding)
TRUNCATE TABLE donation_claims, requests, donations, food_items, profiles CASCADE;

-- =====================================================
-- SEED FOOD ITEMS
-- =====================================================

INSERT INTO food_items (id, name, description, image_url, allergens) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Pasta Salad', 'Fresh pasta salad with vegetables and italian dressing', '/images/pasta.jpg', ARRAY['gluten']),
    ('550e8400-e29b-41d4-a716-446655440002', 'Salmon Soup', 'Traditional Finnish salmon soup with potatoes and dill', '/images/salmon_soup.jpg', ARRAY['fish', 'dairy']),
    ('550e8400-e29b-41d4-a716-446655440003', 'Vegan Stew', 'Hearty vegetable stew with beans and herbs', '/images/vegan_stew.jpg', ARRAY[]::TEXT[]),
    ('550e8400-e29b-41d4-a716-446655440004', 'Chicken Curry', 'Mild chicken curry with rice', '/images/chicken_curry.jpg', ARRAY['dairy']),
    ('550e8400-e29b-41d4-a716-446655440005', 'Karelian Pie', 'Traditional Finnish pastry with rice filling', '/images/karelian_pie.jpg', ARRAY['gluten', 'dairy']),
    ('550e8400-e29b-41d4-a716-446655440006', 'Meatballs', 'Swedish-style meatballs with cream sauce', '/images/meatballs.jpg', ARRAY['gluten', 'dairy', 'eggs']),
    ('550e8400-e29b-41d4-a716-446655440007', 'Caesar Salad', 'Fresh romaine lettuce with caesar dressing and croutons', '/images/salad.jpg', ARRAY['gluten', 'dairy', 'eggs', 'fish']);

-- =====================================================
-- SEED USER PROFILES 
-- Note: These will be created when users sign up through Supabase Auth
-- This is for reference - actual profiles are created via auth triggers
-- =====================================================

-- The following INSERT statements will be executed after user signup
-- They correspond to the mock users in /mockData/users.json

-- User 1: alice@zipli.test (food_donor)
-- User 2: bob@zipli.test (food_receiver)  
-- User 3: helsinki.airport@sodexo.com (food_donor)
-- User 4: helsinki.community@redcross.org (food_receiver)
-- User 5: city.admin@helsinki.fi (city)
-- User 6: terminal.operator@zipli.test (terminals)
-- User 7: tsanssi@zipli.test (food_receiver)
-- User 8: sodexo.ladonlukko@sodexo.com (food_donor)

-- =====================================================
-- SEED DONATIONS
-- Note: These reference user IDs that will be created through auth
-- In actual implementation, we'll need to update these with real UUIDs
-- =====================================================

-- Sample donations - will be updated with actual user UUIDs after auth setup
-- INSERT INTO donations (id, food_item_id, donor_id, quantity, status, pickup_time, pickup_slots) VALUES
--     ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'user-1-uuid', 5.5, 'available', '2024-01-20 14:00:00+02', '[]'),
--     ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'user-3-uuid', 8.2, 'available', '2024-01-21 16:30:00+02', '[]');

-- =====================================================
-- SEED REQUESTS
-- Note: These reference user IDs that will be created through auth  
-- =====================================================

-- Sample requests - will be updated with actual user UUIDs after auth setup
-- INSERT INTO requests (id, user_id, description, people_count, pickup_date, pickup_start_time, pickup_end_time, is_recurring, status) VALUES
--     ('770e8400-e29b-41d4-a716-446655440001', 'user-2-uuid', 'Need food for 20 people at homeless shelter', 20, '2024-01-20', '10:00', '14:00', false, 'active'),
--     ('770e8400-e29b-41d4-a716-446655440002', 'user-7-uuid', 'Weekly food collection for community kitchen', 50, '2024-01-25', '09:00', '12:00', true, 'active');

-- =====================================================
-- DEVELOPMENT HELPER FUNCTIONS
-- =====================================================

-- Function to create a test user profile (for development)
CREATE OR REPLACE FUNCTION create_test_profile(
    user_id UUID,
    email TEXT,
    user_role user_role,
    full_name TEXT,
    organization_name TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO profiles (id, role, full_name, organization_name)
    VALUES (user_id, user_role, full_name, organization_name)
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        organization_name = EXCLUDED.organization_name;
END;
$$ LANGUAGE plpgsql;

-- Function to seed sample donations for a donor
CREATE OR REPLACE FUNCTION create_sample_donations(donor_id UUID)
RETURNS VOID AS $$
DECLARE
    food_item_ids UUID[] := ARRAY[
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440003'
    ];
    quantities DECIMAL[] := ARRAY[5.5, 8.2, 3.0];
    pickup_times TIMESTAMPTZ[] := ARRAY[
        '2024-01-20 14:00:00+02',
        '2024-01-21 16:30:00+02', 
        '2024-01-22 12:00:00+02'
    ];
    i INTEGER;
BEGIN
    FOR i IN 1..3 LOOP
        INSERT INTO donations (food_item_id, donor_id, quantity, status, pickup_time)
        VALUES (food_item_ids[i], donor_id, quantities[i], 'available', pickup_times[i]);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to seed sample requests for a receiver
CREATE OR REPLACE FUNCTION create_sample_requests(receiver_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO requests (user_id, description, people_count, pickup_date, pickup_start_time, pickup_end_time, is_recurring, status)
    VALUES 
        (receiver_id, 'Need food for 20 people at homeless shelter', 20, '2024-01-20', '10:00', '14:00', false, 'active'),
        (receiver_id, 'Weekly food collection for community kitchen', 50, '2024-01-25', '09:00', '12:00', true, 'active');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- REAL-TIME SUBSCRIPTIONS SETUP
-- =====================================================

-- Enable real-time for relevant tables
ALTER publication supabase_realtime ADD TABLE donations;
ALTER publication supabase_realtime ADD TABLE requests;
ALTER publication supabase_realtime ADD TABLE donation_claims;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION create_test_profile IS 'Helper function to create test user profiles during development';
COMMENT ON FUNCTION create_sample_donations IS 'Creates sample donations for a given donor user';
COMMENT ON FUNCTION create_sample_requests IS 'Creates sample requests for a given receiver user';

-- =====================================================
-- ANALYTICS VIEWS FOR CITY DASHBOARD
-- =====================================================

-- View for city-wide donation statistics
CREATE OR REPLACE VIEW city_donation_stats AS
SELECT 
    COUNT(*) as total_donations,
    COUNT(*) FILTER (WHERE status = 'available') as available_donations,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_donations,
    SUM(quantity) FILTER (WHERE status = 'completed') as total_kg_donated,
    COUNT(DISTINCT donor_id) as active_donors,
    DATE_TRUNC('month', created_at) as month
FROM donations
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- View for city-wide request statistics  
CREATE OR REPLACE VIEW city_request_stats AS
SELECT 
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status = 'active') as active_requests,
    COUNT(*) FILTER (WHERE status = 'fulfilled') as fulfilled_requests,
    SUM(people_count) FILTER (WHERE status = 'fulfilled') as people_served,
    COUNT(DISTINCT user_id) as active_receivers,
    DATE_TRUNC('month', created_at) as month
FROM requests  
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- View for partner organizations
CREATE OR REPLACE VIEW partner_organizations AS
SELECT 
    p.id,
    p.full_name,
    p.organization_name,
    p.role,
    COUNT(d.id) as donation_count,
    SUM(d.quantity) FILTER (WHERE d.status = 'completed') as total_kg_donated,
    MAX(d.created_at) as last_donation_date
FROM profiles p
LEFT JOIN donations d ON p.id = d.donor_id
WHERE p.role IN ('food_donor', 'food_receiver')
GROUP BY p.id, p.full_name, p.organization_name, p.role
HAVING COUNT(d.id) > 0 OR p.role = 'food_receiver'
ORDER BY donation_count DESC NULLS LAST;

COMMENT ON VIEW city_donation_stats IS 'Monthly donation statistics for city analytics';
COMMENT ON VIEW city_request_stats IS 'Monthly request statistics for city analytics';
COMMENT ON VIEW partner_organizations IS 'Partner organization statistics for city dashboard';