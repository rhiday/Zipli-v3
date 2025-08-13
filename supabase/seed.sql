-- =====================================================
-- SUPABASE SEED DATA
-- Run this script to populate your database with test data
-- =====================================================

-- Clear existing data (optional - be careful in production!)
-- DELETE FROM donation_claims;
-- DELETE FROM donations;
-- DELETE FROM requests;
-- DELETE FROM food_items;
-- DELETE FROM profiles;

-- ===== STEP 1: Create test users in Supabase Auth =====
-- Note: You need to manually create these users in Supabase Auth Console
-- or use the Supabase Auth API to create them programmatically
-- Email: hasan@zipli.test, Password: password
-- Email: maria@zipli.test, Password: password  
-- Email: city@zipli.test, Password: password
-- Email: terminal@zipli.test, Password: password
-- Email: alice@zipli.test, Password: password
-- Email: kirkko@zipli.test, Password: password

-- ===== STEP 2: Insert profiles (after creating auth users) =====
-- Replace these IDs with actual auth.users IDs from your Supabase project

-- Example profiles (you'll need to get the actual user IDs after creating auth users)
INSERT INTO profiles (id, role, full_name, email, organization_name, contact_number, address) VALUES
-- Get these IDs from auth.users table after creating users
-- ('actual-uuid-from-auth-users-1', 'food_donor', 'Hasan Donor', 'hasan@zipli.test', 'Zipli Restaurant', '+358 40 123 4567', 'Mannerheimintie 1, Helsinki'),
-- ('actual-uuid-from-auth-users-2', 'food_receiver', 'Maria Receiver', 'maria@zipli.test', 'Red Cross Helsinki', '+358 40 234 5678', 'Kaisaniemenkatu 10, Helsinki'),
-- ('actual-uuid-from-auth-users-3', 'city', 'City Admin', 'city@zipli.test', 'Helsinki City', '+358 40 345 6789', 'Pohjoisesplanadi 11-13, Helsinki'),
-- ('actual-uuid-from-auth-users-4', 'terminals', 'Terminal Operator', 'terminal@zipli.test', 'Helsinki Airport Terminal', '+358 40 456 7890', 'Helsinki Airport, Vantaa'),
-- ('actual-uuid-from-auth-users-5', 'food_donor', 'Alice Restaurant', 'alice@zipli.test', 'Alice''s Kitchen', '+358 40 567 8901', 'Aleksanterinkatu 52, Helsinki'),
-- ('actual-uuid-from-auth-users-6', 'food_receiver', 'Andreas Church', 'kirkko@zipli.test', 'Andreas Congregation', '+358 40 678 9012', 'Vuorikatu 5, Helsinki');

-- ===== STEP 3: Insert food items =====
INSERT INTO food_items (name, description, allergens, category, image_url) VALUES
('Fresh Bread', 'Daily baked bread from our bakery. Perfect for sandwiches or as a side.', 'Wheat, Gluten', 'Bakery', '/images/bread.jpg'),
('Vegetable Soup', 'Hearty vegetable soup with seasonal vegetables. Perfect for cold days.', 'Celery', 'Prepared Food', '/images/soup.jpg'),
('Fresh Produce Box', 'Assorted seasonal fruits and vegetables. May include apples, carrots, potatoes, and more.', 'None', 'Produce', '/images/produce.jpg'),
('Dairy Products', 'Milk, cheese, and yogurt close to expiry but still perfectly good.', 'Milk, Lactose', 'Dairy', '/images/dairy.jpg'),
('Rice and Grains', 'Bulk rice, pasta, and other grain products. Long shelf life.', 'Gluten (pasta)', 'Dry Goods', '/images/grains.jpg'),
('Canned Goods', 'Assorted canned vegetables, fruits, and ready meals.', 'Varies', 'Canned Food', '/images/canned.jpg'),
('Fresh Salad Mix', 'Pre-washed salad greens and vegetables ready to eat.', 'None', 'Produce', '/images/salad.jpg'),
('Meat Products', 'Frozen chicken, beef, and pork. Must be collected same day.', 'None', 'Meat', '/images/meat.jpg'),
('Fish and Seafood', 'Fresh and frozen fish. High in omega-3.', 'Fish, Shellfish', 'Seafood', '/images/fish.jpg'),
('Baked Goods', 'Pastries, cakes, and cookies from our bakery.', 'Wheat, Eggs, Milk', 'Bakery', '/images/pastries.jpg'),
('Baby Food', 'Unopened jars of baby food and formula.', 'Varies', 'Baby Products', '/images/babyfood.jpg'),
('Breakfast Cereals', 'Various breakfast cereals and oats.', 'Wheat, Nuts', 'Dry Goods', '/images/cereal.jpg'),
('Cooking Oil', 'Vegetable and olive oil for cooking.', 'None', 'Cooking Essentials', '/images/oil.jpg'),
('Spices and Herbs', 'Assorted spices and dried herbs.', 'None', 'Cooking Essentials', '/images/spices.jpg'),
('Tea and Coffee', 'Various teas and ground coffee.', 'None', 'Beverages', '/images/coffee.jpg');

-- ===== STEP 4: Insert sample donations =====
-- Note: You'll need to update donor_id with actual user IDs after creating profiles
-- Also update food_item_id with actual IDs from the food_items table after insertion

-- Example donations (uncomment and update IDs after creating users and food items):
/*
INSERT INTO donations (food_item_id, donor_id, quantity, status, pickup_date, pickup_start_time, pickup_end_time) VALUES
-- Get food_item_id from food_items table and donor_id from profiles table
((SELECT id FROM food_items WHERE name = 'Fresh Bread' LIMIT 1), 
 (SELECT id FROM profiles WHERE email = 'hasan@zipli.test' LIMIT 1), 
 10, 'available', CURRENT_DATE + INTERVAL '1 day', '10:00:00', '12:00:00'),

((SELECT id FROM food_items WHERE name = 'Vegetable Soup' LIMIT 1), 
 (SELECT id FROM profiles WHERE email = 'alice@zipli.test' LIMIT 1), 
 5, 'available', CURRENT_DATE + INTERVAL '1 day', '14:00:00', '16:00:00'),

((SELECT id FROM food_items WHERE name = 'Fresh Produce Box' LIMIT 1), 
 (SELECT id FROM profiles WHERE email = 'hasan@zipli.test' LIMIT 1), 
 8, 'available', CURRENT_DATE + INTERVAL '2 days', '09:00:00', '11:00:00'),

((SELECT id FROM food_items WHERE name = 'Dairy Products' LIMIT 1), 
 (SELECT id FROM profiles WHERE email = 'alice@zipli.test' LIMIT 1), 
 15, 'available', CURRENT_DATE, '16:00:00', '18:00:00'),

((SELECT id FROM food_items WHERE name = 'Rice and Grains' LIMIT 1), 
 (SELECT id FROM profiles WHERE email = 'hasan@zipli.test' LIMIT 1), 
 20, 'available', CURRENT_DATE + INTERVAL '3 days', '11:00:00', '13:00:00');
*/

-- ===== STEP 5: Insert sample requests =====
-- Example requests (uncomment and update IDs after creating users):
/*
INSERT INTO requests (user_id, description, people_count, pickup_date, pickup_start_time, pickup_end_time, status, is_recurring) VALUES
((SELECT id FROM profiles WHERE email = 'maria@zipli.test' LIMIT 1),
 'Need warm meals for 50 people at our shelter', 50, 
 CURRENT_DATE + INTERVAL '1 day', '11:00:00', '13:00:00', 'active', false),

((SELECT id FROM profiles WHERE email = 'kirkko@zipli.test' LIMIT 1),
 'Weekly food assistance for 30 families', 30, 
 CURRENT_DATE + INTERVAL '2 days', '14:00:00', '16:00:00', 'active', true),

((SELECT id FROM profiles WHERE email = 'maria@zipli.test' LIMIT 1),
 'Emergency food supplies needed for 20 people', 20, 
 CURRENT_DATE, '17:00:00', '19:00:00', 'active', false);
*/

-- ===== STEP 6: Verify data =====
-- Run these queries to verify the seed data was inserted correctly:

-- Check profiles
SELECT id, email, full_name, role, organization_name FROM profiles;

-- Check food items
SELECT id, name, category FROM food_items;

-- Check donations with food item details
SELECT 
    d.id,
    d.quantity,
    d.status,
    d.pickup_date,
    fi.name as food_name,
    p.full_name as donor_name
FROM donations d
JOIN food_items fi ON d.food_item_id = fi.id
JOIN profiles p ON d.donor_id = p.id;

-- Check requests
SELECT 
    r.id,
    r.description,
    r.people_count,
    r.pickup_date,
    r.status,
    p.full_name as requester_name
FROM requests r
JOIN profiles p ON r.user_id = p.id;