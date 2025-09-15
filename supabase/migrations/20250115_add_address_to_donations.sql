-- =====================================================
-- ADD ADDRESS FIELD TO DONATIONS TABLE
-- Created: 2025-01-15
-- Description: Adds address field to donations table to match requests table
-- =====================================================

-- Add address field to donations table
ALTER TABLE donations
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add comment for the new column
COMMENT ON COLUMN donations.address IS 'Pickup address for the donation';
