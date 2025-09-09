-- =====================================================
-- ADD CATEGORY TO REQUESTS TABLE
-- Created: 2025-09-09
-- Description: Adds category column to requests table for food categorization
-- =====================================================

-- Add category column to requests table
ALTER TABLE requests 
ADD COLUMN category TEXT;

-- Add comment for documentation
COMMENT ON COLUMN requests.category IS 'Food category for the request (main_protein, energy_supplement, soup, salad_ingredients, other)';

-- Create index for better query performance
CREATE INDEX idx_requests_category ON requests(category);