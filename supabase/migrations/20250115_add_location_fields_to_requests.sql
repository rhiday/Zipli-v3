-- =====================================================
-- ADD LOCATION FIELDS TO REQUESTS TABLE
-- Created: 2025-01-15
-- Description: Adds postal_code and timezone fields to requests table
-- Note: Using address field instead of latitude/longitude coordinates
-- =====================================================

-- Add location and timezone fields to requests table
ALTER TABLE requests
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);

-- Add comments for the new columns
COMMENT ON COLUMN requests.postal_code IS 'Postal code for the delivery address';
COMMENT ON COLUMN requests.timezone IS 'Timezone for the request (e.g., Europe/Helsinki)';
