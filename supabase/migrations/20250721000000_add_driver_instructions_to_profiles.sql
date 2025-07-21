-- Add driver_instructions field to profiles table for default instructions
ALTER TABLE public.profiles 
ADD COLUMN driver_instructions TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN public.profiles.driver_instructions IS 'Default delivery instructions for drivers (can be overridden per donation)';