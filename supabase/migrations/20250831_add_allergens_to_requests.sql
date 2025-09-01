-- =====================================================
-- ADD ALLERGENS TO REQUESTS TABLE
-- Created: 2025-08-31
-- Description: Adds allergens column to requests table for dietary restrictions
-- =====================================================

-- Add allergens column to requests table
ALTER TABLE requests 
ADD COLUMN allergens TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN requests.allergens IS 'Array of dietary restrictions/allergens for the food request';

-- Update any existing requests to have empty allergens array if null
UPDATE requests 
SET allergens = '{}' 
WHERE allergens IS NULL;