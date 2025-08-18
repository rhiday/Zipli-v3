-- Add missing columns to donations table (not mandatory)

-- Add notes column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'donations' AND column_name = 'notes') THEN
    ALTER TABLE donations ADD COLUMN notes text NULL;
  END IF;
END $$;

-- Add pickup_slots column if it doesn't exist  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'donations' AND column_name = 'pickup_slots') THEN
    ALTER TABLE donations ADD COLUMN pickup_slots jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');