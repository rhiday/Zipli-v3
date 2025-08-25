-- Add matchmaking fields for improved food redistribution
-- Created: 2025-08-25
-- Description: Adds allergens, location coordinates, and other critical fields for matchmaking

-- Add allergens to requests table (critical for dietary matching)
ALTER TABLE requests
ADD COLUMN allergens JSONB DEFAULT '[]'::jsonb;

-- Add location coordinates for distance-based matching
ALTER TABLE donations
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN postal_code TEXT;

ALTER TABLE requests  
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN postal_code TEXT;

-- Add start_date and end_date to donations table for recurring donations
ALTER TABLE donations
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE;

-- Add food categories and expiry dates for better matching
ALTER TABLE food_items
ADD COLUMN category TEXT,
ADD COLUMN expires_at TIMESTAMPTZ;

-- Add unit specification for quantities
ALTER TABLE donations
ADD COLUMN unit TEXT DEFAULT 'kg';

-- Add dietary preferences beyond allergens
ALTER TABLE requests
ADD COLUMN dietary_preferences JSONB DEFAULT '[]'::jsonb;

-- Add delivery preferences
ALTER TABLE requests
ADD COLUMN delivery_preference TEXT DEFAULT 'pickup' CHECK (delivery_preference IN ('pickup', 'delivery', 'either'));

-- Add timezone support for better scheduling
ALTER TABLE donations
ADD COLUMN timezone TEXT DEFAULT 'UTC';

ALTER TABLE requests
ADD COLUMN timezone TEXT DEFAULT 'UTC';

-- Add constraints for date ranges
ALTER TABLE donations 
ADD CONSTRAINT check_donation_date_range 
CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date);

-- Add indexes for matchmaking queries
CREATE INDEX idx_requests_allergens ON requests USING GIN (allergens);
CREATE INDEX idx_requests_dietary_preferences ON requests USING GIN (dietary_preferences);
CREATE INDEX idx_requests_location ON requests (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_donations_location ON donations (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_donations_start_date ON donations (start_date) WHERE start_date IS NOT NULL;
CREATE INDEX idx_donations_end_date ON donations (end_date) WHERE end_date IS NOT NULL;
CREATE INDEX idx_food_items_category ON food_items (category) WHERE category IS NOT NULL;
CREATE INDEX idx_food_items_expires_at ON food_items (expires_at) WHERE expires_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN requests.allergens IS 'JSONB array of allergens to avoid (e.g. ["Gluten", "Nuts"])';
COMMENT ON COLUMN requests.dietary_preferences IS 'JSONB array of positive dietary preferences (e.g. ["Vegan", "Halal"])';
COMMENT ON COLUMN donations.latitude IS 'Latitude coordinate for pickup location';
COMMENT ON COLUMN donations.longitude IS 'Longitude coordinate for pickup location';
COMMENT ON COLUMN requests.latitude IS 'Latitude coordinate for delivery location';
COMMENT ON COLUMN requests.longitude IS 'Longitude coordinate for delivery location';
COMMENT ON COLUMN donations.start_date IS 'Start date for recurring donations';
COMMENT ON COLUMN donations.end_date IS 'End date for recurring donations';
COMMENT ON COLUMN food_items.category IS 'Food category (e.g. "Bakery", "Produce", "Dairy")';
COMMENT ON COLUMN food_items.expires_at IS 'Expiration date/time of the food item';
COMMENT ON COLUMN donations.unit IS 'Unit of measurement for quantity (e.g. "kg", "portions", "items")';
COMMENT ON COLUMN requests.delivery_preference IS 'Whether requester prefers pickup, delivery, or either';
COMMENT ON COLUMN donations.timezone IS 'Timezone for pickup scheduling';
COMMENT ON COLUMN requests.timezone IS 'Timezone for delivery scheduling';