-- Check unique allergen values currently in the database
-- This will show all unique allergen values being used

-- 1. Get all unique allergen values from food_items table
WITH allergen_values AS (
  SELECT DISTINCT unnest(
    CASE 
      WHEN allergens::text LIKE '{%}' THEN 
        string_to_array(
          regexp_replace(allergens::text, '^\{|\}$', '', 'g'),
          ','
        )
      ELSE ARRAY[allergens::text]
    END
  ) as allergen_value
  FROM food_items
  WHERE allergens IS NOT NULL 
    AND allergens::text != '{}'
)
SELECT 
  TRIM(BOTH ' "' FROM allergen_value) as allergen,
  COUNT(*) OVER() as total_unique_values
FROM allergen_values
WHERE allergen_value IS NOT NULL
ORDER BY allergen;

-- 2. Get count of each allergen value
WITH allergen_values AS (
  SELECT unnest(
    CASE 
      WHEN allergens::text LIKE '{%}' THEN 
        string_to_array(
          regexp_replace(allergens::text, '^\{|\}$', '', 'g'),
          ','
        )
      ELSE ARRAY[allergens::text]
    END
  ) as allergen_value
  FROM food_items
  WHERE allergens IS NOT NULL 
    AND allergens::text != '{}'
)
SELECT 
  TRIM(BOTH ' "' FROM allergen_value) as allergen,
  COUNT(*) as usage_count
FROM allergen_values
WHERE allergen_value IS NOT NULL
GROUP BY allergen_value
ORDER BY usage_count DESC, allergen;