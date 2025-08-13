-- =====================================================
-- ZIPLI V3 ROW LEVEL SECURITY POLICIES
-- Created: 2025-01-13
-- Description: Sets up comprehensive RLS policies for secure data access
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_claims ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR POLICIES
-- =====================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION auth.user_has_role(required_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is city admin or terminal operator
CREATE OR REPLACE FUNCTION auth.user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('city', 'terminals')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Donors can read receiver profiles (for donation context)
CREATE POLICY "Donors can read receiver profiles" ON profiles
    FOR SELECT USING (
        auth.user_has_role('food_donor'::user_role) 
        AND role = 'food_receiver'::user_role
    );

-- Receivers can read donor profiles (for marketplace browsing)
CREATE POLICY "Receivers can read donor profiles" ON profiles
    FOR SELECT USING (
        auth.user_has_role('food_receiver'::user_role) 
        AND role = 'food_donor'::user_role
    );

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles
    FOR SELECT USING (auth.user_is_admin());

-- New users can insert their profile during signup
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- =====================================================
-- FOOD ITEMS TABLE POLICIES
-- =====================================================

-- All authenticated users can read food items
CREATE POLICY "All users can read food items" ON food_items
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Donors can create/update food items
CREATE POLICY "Donors can create food items" ON food_items
    FOR INSERT WITH CHECK (auth.user_has_role('food_donor'::user_role));

CREATE POLICY "Donors can update food items" ON food_items
    FOR UPDATE USING (auth.user_has_role('food_donor'::user_role));

-- Admins can manage all food items
CREATE POLICY "Admins can manage food items" ON food_items
    FOR ALL USING (auth.user_is_admin());

-- =====================================================
-- DONATIONS TABLE POLICIES
-- =====================================================

-- Donors can manage their own donations
CREATE POLICY "Donors can manage own donations" ON donations
    FOR ALL USING (donor_id = auth.uid());

-- Receivers can read available donations
CREATE POLICY "Receivers can read available donations" ON donations
    FOR SELECT USING (
        auth.user_has_role('food_receiver'::user_role) 
        AND status = 'available'::donation_status
    );

-- Receivers can also read donations they have claimed
CREATE POLICY "Receivers can read claimed donations" ON donations
    FOR SELECT USING (
        auth.user_has_role('food_receiver'::user_role)
        AND EXISTS (
            SELECT 1 FROM donation_claims 
            WHERE donation_id = donations.id 
            AND receiver_id = auth.uid()
        )
    );

-- Admins can read all donations
CREATE POLICY "Admins can read all donations" ON donations
    FOR SELECT USING (auth.user_is_admin());

-- =====================================================
-- REQUESTS TABLE POLICIES
-- =====================================================

-- Receivers can manage their own requests
CREATE POLICY "Receivers can manage own requests" ON requests
    FOR ALL USING (user_id = auth.uid());

-- Donors can read active requests (for potential fulfillment)
CREATE POLICY "Donors can read active requests" ON requests
    FOR SELECT USING (
        auth.user_has_role('food_donor'::user_role) 
        AND status = 'active'::request_status
    );

-- Admins can read all requests
CREATE POLICY "Admins can read all requests" ON requests
    FOR SELECT USING (auth.user_is_admin());

-- =====================================================
-- DONATION CLAIMS TABLE POLICIES
-- =====================================================

-- Receivers can create claims for available donations
CREATE POLICY "Receivers can create donation claims" ON donation_claims
    FOR INSERT WITH CHECK (
        auth.user_has_role('food_receiver'::user_role)
        AND receiver_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM donations 
            WHERE id = donation_id 
            AND status = 'available'::donation_status
        )
    );

-- Receivers can read their own claims
CREATE POLICY "Receivers can read own claims" ON donation_claims
    FOR SELECT USING (receiver_id = auth.uid());

-- Receivers can update their own pending claims
CREATE POLICY "Receivers can update own pending claims" ON donation_claims
    FOR UPDATE USING (
        receiver_id = auth.uid() 
        AND status = 'pending'::claim_status
    );

-- Donors can read claims for their donations
CREATE POLICY "Donors can read claims for own donations" ON donation_claims
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM donations 
            WHERE id = donation_id 
            AND donor_id = auth.uid()
        )
    );

-- Donors can update claims for their donations (approve/reject)
CREATE POLICY "Donors can update claims for own donations" ON donation_claims
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM donations 
            WHERE id = donation_id 
            AND donor_id = auth.uid()
        )
    );

-- Admins can read all claims
CREATE POLICY "Admins can read all claims" ON donation_claims
    FOR SELECT USING (auth.user_is_admin());

-- =====================================================
-- TRIGGER FUNCTIONS FOR BUSINESS LOGIC
-- =====================================================

-- Function to update donation status when claim is approved
CREATE OR REPLACE FUNCTION update_donation_on_claim_approval()
RETURNS TRIGGER AS $$
BEGIN
    -- If claim is approved, mark donation as claimed
    IF NEW.status = 'approved'::claim_status AND OLD.status = 'pending'::claim_status THEN
        UPDATE donations 
        SET status = 'claimed'::donation_status 
        WHERE id = NEW.donation_id;
        
        NEW.approved_at = NOW();
    END IF;
    
    -- If claim is completed, mark donation as completed
    IF NEW.status = 'completed'::claim_status AND OLD.status = 'approved'::claim_status THEN
        UPDATE donations 
        SET status = 'completed'::donation_status 
        WHERE id = NEW.donation_id;
        
        NEW.completed_at = NOW();
    END IF;
    
    -- If claim is rejected, make donation available again
    IF NEW.status = 'rejected'::claim_status AND OLD.status = 'pending'::claim_status THEN
        UPDATE donations 
        SET status = 'available'::donation_status 
        WHERE id = NEW.donation_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update donation status
CREATE TRIGGER trigger_update_donation_on_claim_approval
    BEFORE UPDATE ON donation_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_donation_on_claim_approval();

-- =====================================================
-- GRANTS FOR SERVICE ROLE
-- =====================================================

-- Grant necessary permissions to service role for admin operations
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION auth.user_has_role(user_role) IS 'Helper function to check if authenticated user has a specific role';
COMMENT ON FUNCTION auth.user_is_admin() IS 'Helper function to check if authenticated user is admin (city/terminals)';
COMMENT ON FUNCTION update_donation_on_claim_approval() IS 'Automatically updates donation status when claims are approved/rejected/completed';