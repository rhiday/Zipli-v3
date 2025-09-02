-- =====================================================
-- CLEANUP ALLERGEN DATA MIGRATION
-- Created: 2025-09-02
-- Description: Cleans up corrupted allergen data in food_items table
-- =====================================================

-- Function to clean up corrupted allergen strings
CREATE OR REPLACE FUNCTION clean_allergen_data(input_text text)
RETURNS text[] AS $$
DECLARE
    result text[];
    cleaned_text text;
BEGIN
    -- Handle null or empty input
    IF input_text IS NULL OR input_text = '' THEN
        RETURN '{}';
    END IF;
    
    -- If it's already a valid PostgreSQL array format, return as is
    IF input_text ~ '^\{.*\}$' THEN
        -- Try to cast it directly
        BEGIN
            result := input_text::text[];
            RETURN result;
        EXCEPTION WHEN OTHERS THEN
            -- If casting fails, continue with cleanup
            NULL;
        END;
    END IF;
    
    -- Remove excessive escaping and JSON artifacts
    cleaned_text := input_text;
    
    -- Remove multiple levels of JSON encoding
    WHILE cleaned_text ~ '^\[".*"\]$' OR cleaned_text ~ '^".*"$' LOOP
        -- Remove outer quotes and brackets
        cleaned_text := regexp_replace(cleaned_text, '^(\[")?(.*?)("\])?$', '\2');
        -- Unescape quotes
        cleaned_text := replace(cleaned_text, '\"', '"');
        cleaned_text := replace(cleaned_text, '\\', '');
    END LOOP;
    
    -- Try to parse as JSON array
    IF cleaned_text ~ '^\[.*\]$' THEN
        BEGIN
            result := ARRAY(SELECT json_array_elements_text(cleaned_text::json));
            RETURN result;
        EXCEPTION WHEN OTHERS THEN
            -- If JSON parsing fails, continue with manual parsing
            NULL;
        END;
    END IF;
    
    -- Extract meaningful content (Finnish and English allergen names)
    -- Handle comma-separated values
    IF cleaned_text ~ ',' THEN
        result := string_to_array(cleaned_text, ',');
    ELSE
        result := ARRAY[cleaned_text];
    END IF;
    
    -- Clean each element
    FOR i IN 1..array_length(result, 1) LOOP
        IF result[i] IS NOT NULL THEN
            -- Trim whitespace and quotes
            result[i] := trim(both ' "[]' from result[i]);
            
            -- Normalize common variations
            IF lower(result[i]) IN ('not specified', 'none', 'null', '') THEN
                result[i] := 'Not specified';
            ELSIF lower(result[i]) IN ('ei määritelty', 'ei mitään') THEN
                result[i] := 'Ei määritelty';
            END IF;
        END IF;
    END LOOP;
    
    -- Remove empty elements
    result := array_remove(result, NULL);
    result := array_remove(result, '');
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update food_items table to clean allergen data
UPDATE food_items
SET allergens = clean_allergen_data(allergens::text)
WHERE allergens IS NOT NULL 
  AND allergens::text != '{}'
  AND (
    allergens::text LIKE '%\\%'  -- Has escaping
    OR allergens::text LIKE '%[%'  -- Has JSON array brackets
    OR allergens::text LIKE '%"%'  -- Has quoted strings
    OR allergens::text NOT LIKE '{%' -- Not in PostgreSQL array format
  );

-- Log the cleanup results
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Cleaned up % food items with corrupted allergen data', updated_count;
END $$;

-- Drop the temporary function
DROP FUNCTION IF EXISTS clean_allergen_data(text);

-- Add comment for documentation
COMMENT ON COLUMN food_items.allergens IS 'Array of allergen information in PostgreSQL array format. Use {value1,value2} or {"value 1","value 2"} format for values with spaces.';