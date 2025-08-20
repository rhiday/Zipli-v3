-- Add missing fields to requests table
-- Created: 2025-08-20
-- Description: Adds address, instructions, start_date, end_date, and recurrence_pattern fields to requests table

-- Add the missing columns to requests table
ALTER TABLE requests
ADD COLUMN address TEXT,
ADD COLUMN instructions TEXT,
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE,
ADD COLUMN recurrence_pattern TEXT;

-- Add comments for the new columns
COMMENT ON COLUMN requests.address IS 'Delivery address for the request';
COMMENT ON COLUMN requests.instructions IS 'Special instructions for the driver';
COMMENT ON COLUMN requests.start_date IS 'Start date of the request period';
COMMENT ON COLUMN requests.end_date IS 'End date of the request period';
COMMENT ON COLUMN requests.recurrence_pattern IS 'JSON string containing recurrence pattern details';

-- Update the constraint to ensure end_date is after start_date (if both are provided)
ALTER TABLE requests 
ADD CONSTRAINT check_request_date_range 
CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date);