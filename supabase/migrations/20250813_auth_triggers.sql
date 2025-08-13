-- =====================================================
-- AUTHENTICATION TRIGGERS AND FUNCTIONS
-- Created: 2025-01-13
-- Description: Handles automatic profile creation and auth workflows
-- =====================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role user_role;
  display_name TEXT;
BEGIN
  -- Extract role from user metadata (set during signup)
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'food_receiver')::user_role;
  
  -- Extract display name from metadata or use email
  display_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  
  -- Insert the profile
  INSERT INTO public.profiles (
    id,
    role,
    full_name,
    organization_name,
    contact_number,
    address,
    driver_instructions
  ) VALUES (
    NEW.id,
    user_role,
    display_name,
    NEW.raw_user_meta_data->>'organization_name',
    NEW.raw_user_meta_data->>'contact_number',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'driver_instructions'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user deletion (cleanup profiles)
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Profile will be automatically deleted due to CASCADE foreign key
  -- But we can add additional cleanup logic here if needed
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call cleanup function on user deletion
CREATE OR REPLACE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- =====================================================
-- DEVELOPMENT HELPER FUNCTIONS FOR TESTING
-- =====================================================

-- Function to create test users with profiles (for development/testing)
CREATE OR REPLACE FUNCTION create_test_user_with_profile(
  test_email TEXT,
  test_password TEXT,
  user_role user_role,
  full_name TEXT,
  organization_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- This would normally be done through Supabase Auth API
  -- This function is for development seeding only
  
  -- Generate a UUID for the user
  new_user_id := uuid_generate_v4();
  
  -- Create the profile directly (simulating auth trigger)
  INSERT INTO public.profiles (
    id,
    role,
    full_name,
    organization_name
  ) VALUES (
    new_user_id,
    user_role,
    full_name,
    organization_name
  );
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to seed test users for development
CREATE OR REPLACE FUNCTION seed_test_users() RETURNS VOID AS $$
DECLARE
  donor1_id UUID;
  donor2_id UUID;
  donor3_id UUID;
  receiver1_id UUID;
  receiver2_id UUID;
  receiver3_id UUID;
  city_id UUID;
  terminal_id UUID;
BEGIN
  -- Clear existing test data
  DELETE FROM profiles WHERE full_name IN (
    'Alice''s Restaurant', 'Bob''s Charity House', 'Sodexo Helsinki Airport',
    'Red Cross Helsinki Community', 'Helsinki City Administrator', 
    'Terminal Operator', 'Tsänssi Charity', 'Sodexo Ladonlukko'
  );
  
  -- Create test users (this simulates the auth signup + trigger)
  donor1_id := create_test_user_with_profile(
    'alice@zipli.test', 'password', 'food_donor', 'Alice''s Restaurant', NULL
  );
  
  receiver1_id := create_test_user_with_profile(
    'bob@zipli.test', 'password', 'food_receiver', 'Bob''s Charity House', NULL
  );
  
  donor2_id := create_test_user_with_profile(
    'helsinki.airport@sodexo.com', 'password', 'food_donor', 
    'Sodexo Helsinki Airport', 'Sodexo'
  );
  
  receiver2_id := create_test_user_with_profile(
    'helsinki.community@redcross.org', 'password', 'food_receiver',
    'Red Cross Helsinki Community', 'Red Cross'
  );
  
  city_id := create_test_user_with_profile(
    'city.admin@helsinki.fi', 'password', 'city',
    'Helsinki City Administrator', 'City of Helsinki'
  );
  
  terminal_id := create_test_user_with_profile(
    'terminal.operator@zipli.test', 'password', 'terminals',
    'Terminal Operator', 'Zipli Terminal Services'
  );
  
  receiver3_id := create_test_user_with_profile(
    'tsanssi@zipli.test', 'password', 'food_receiver',
    'Tsänssi Charity', 'Tsänssi'
  );
  
  donor3_id := create_test_user_with_profile(
    'sodexo.ladonlukko@sodexo.com', 'password', 'food_donor',
    'Sodexo Ladonlukko', 'Sodexo'
  );
  
  -- Create sample donations for donors
  PERFORM create_sample_donations(donor1_id);
  PERFORM create_sample_donations(donor2_id);
  PERFORM create_sample_donations(donor3_id);
  
  -- Create sample requests for receivers  
  PERFORM create_sample_requests(receiver1_id);
  PERFORM create_sample_requests(receiver2_id);
  PERFORM create_sample_requests(receiver3_id);
  
  RAISE NOTICE 'Test users created successfully';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EMAIL TEMPLATE CUSTOMIZATION
-- =====================================================

-- Function to customize auth email templates
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  claims JSONB;
  user_role TEXT;
BEGIN
  -- Get user role from profile
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = (event->>'user_id')::UUID;
  
  -- Set custom claims
  claims := event->'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  claims := jsonb_set(claims, '{app}', '"zipli"');
  
  -- Return modified claims
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION handle_new_user() IS 'Automatically creates a profile when a new user signs up through Supabase Auth';
COMMENT ON FUNCTION handle_user_delete() IS 'Handles cleanup when a user account is deleted';
COMMENT ON FUNCTION create_test_user_with_profile IS 'Development helper to create test users with profiles';
COMMENT ON FUNCTION seed_test_users() IS 'Seeds the database with test users for development';
COMMENT ON FUNCTION custom_access_token_hook IS 'Adds custom claims to JWT tokens including user role';