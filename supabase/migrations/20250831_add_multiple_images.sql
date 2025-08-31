-- Migration: Add support for multiple images per food item
-- Date: 2025-08-31
-- Description: Replace single image_url with image_urls JSONB array

-- Add new column for multiple image URLs
ALTER TABLE food_items 
ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;

-- Migrate existing image_url data to image_urls array
UPDATE food_items 
SET image_urls = CASE 
    WHEN image_url IS NOT NULL AND image_url != '' 
    THEN jsonb_build_array(image_url)
    ELSE '[]'::jsonb
END;

-- Add a check constraint to ensure image_urls is an array
ALTER TABLE food_items 
ADD CONSTRAINT image_urls_is_array 
CHECK (jsonb_typeof(image_urls) = 'array');

-- Add comment for documentation
COMMENT ON COLUMN food_items.image_urls IS 'JSON array of image URLs for the food item';

-- Note: We keep image_url for backward compatibility during transition
-- It can be dropped in a future migration once all code is updated