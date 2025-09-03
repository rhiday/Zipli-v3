-- =====================================================
-- ALLERGEN DATA VERIFICATION QUERIES
-- Run these in Supabase SQL Editor to verify allergen fixes
-- =====================================================

-- 1. Check for corrupted allergen data
SELECT 
    id,
    name,
    allergens,
    CASE 
        WHEN allergens IS NULL THEN 'NULL'
        WHEN allergens::text = '{}' THEN 'EMPTY'
        WHEN allergens::text LIKE '{%}' THEN 'CORRECT_FORMAT'
        WHEN allergens::text LIKE '%\\%' THEN 'HAS_ESCAPING'
        WHEN allergens::text LIKE '%[%' THEN 'JSON_ARRAY'
        WHEN allergens::text LIKE '%"%' THEN 'QUOTED_STRING'
        ELSE 'UNKNOWN_FORMAT'
    END as format_status,
    LENGTH(allergens::text) as data_length
FROM food_items
WHERE allergens IS NOT NULL
ORDER BY format_status, created_at DESC
LIMIT 50;

-- 2. Count items by format status
SELECT 
    CASE 
        WHEN allergens IS NULL THEN 'NULL'
        WHEN allergens::text = '{}' THEN 'EMPTY'
        WHEN allergens::text LIKE '{%}' AND allergens::text NOT LIKE '%\\%' THEN 'CORRECT_FORMAT'
        WHEN allergens::text LIKE '%\\%' THEN 'HAS_ESCAPING'
        WHEN allergens::text LIKE '%[%' THEN 'JSON_ARRAY'
        WHEN allergens::text LIKE '%"%' AND allergens::text NOT LIKE '{%' THEN 'QUOTED_STRING'
        ELSE 'UNKNOWN_FORMAT'
    END as format_status,
    COUNT(*) as item_count
FROM food_items
GROUP BY format_status
ORDER BY item_count DESC;

-- 3. Find Finnish allergen entries
SELECT 
    id,
    name,
    allergens
FROM food_items
WHERE allergens::text ILIKE '%määritelty%'
   OR allergens::text ILIKE '%gluteeniton%'
   OR allergens::text ILIKE '%laktoositon%'
LIMIT 20;

-- 4. Show sample of each format type
WITH categorized AS (
    SELECT 
        id,
        name,
        allergens,
        CASE 
            WHEN allergens IS NULL THEN 'NULL'
            WHEN allergens::text = '{}' THEN 'EMPTY'
            WHEN allergens::text LIKE '{%}' AND allergens::text NOT LIKE '%\\%' THEN 'CORRECT_FORMAT'
            WHEN allergens::text LIKE '%\\%' THEN 'HAS_ESCAPING'
            WHEN allergens::text LIKE '%[%' THEN 'JSON_ARRAY'
            ELSE 'OTHER'
        END as format_status,
        ROW_NUMBER() OVER (PARTITION BY 
            CASE 
                WHEN allergens IS NULL THEN 'NULL'
                WHEN allergens::text = '{}' THEN 'EMPTY'
                WHEN allergens::text LIKE '{%}' AND allergens::text NOT LIKE '%\\%' THEN 'CORRECT_FORMAT'
                WHEN allergens::text LIKE '%\\%' THEN 'HAS_ESCAPING'
                WHEN allergens::text LIKE '%[%' THEN 'JSON_ARRAY'
                ELSE 'OTHER'
            END 
            ORDER BY created_at DESC
        ) as rn
    FROM food_items
    WHERE allergens IS NOT NULL
)
SELECT 
    format_status,
    id,
    name,
    allergens
FROM categorized
WHERE rn <= 2
ORDER BY format_status, rn;

-- 5. Test the cleanup function (if migration was run)
-- This will show before/after for corrupted entries
SELECT 
    id,
    name,
    allergens as current_value,
    CASE 
        WHEN allergens::text LIKE '%\\%' OR 
             allergens::text LIKE '%[%' OR
             (allergens::text LIKE '%"%' AND allergens::text NOT LIKE '{%')
        THEN 'NEEDS_CLEANUP'
        ELSE 'OK'
    END as status
FROM food_items
WHERE allergens IS NOT NULL
  AND (
    allergens::text LIKE '%\\%'
    OR allergens::text LIKE '%[%'
    OR (allergens::text LIKE '%"%' AND allergens::text NOT LIKE '{%')
  )
LIMIT 10;

-- 6. Quick health check
SELECT 
    'Total food items' as metric,
    COUNT(*) as value
FROM food_items
UNION ALL
SELECT 
    'Items with allergens' as metric,
    COUNT(*) as value
FROM food_items
WHERE allergens IS NOT NULL AND allergens::text != '{}'
UNION ALL
SELECT 
    'Items needing cleanup' as metric,
    COUNT(*) as value
FROM food_items
WHERE allergens IS NOT NULL 
  AND allergens::text != '{}'
  AND (
    allergens::text LIKE '%\\%'
    OR allergens::text LIKE '%[%'
    OR (allergens::text LIKE '%"%' AND allergens::text NOT LIKE '{%')
  );