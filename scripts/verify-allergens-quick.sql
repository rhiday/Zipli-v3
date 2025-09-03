-- =====================================================
-- QUICK ALLERGEN VERIFICATION (Performance Optimized)
-- These queries are optimized to run fast without affecting DB performance
-- =====================================================

-- 1. INSTANT HEALTH CHECK (uses COUNT which is very fast)
SELECT 
    COUNT(*) FILTER (WHERE allergens IS NOT NULL) as items_with_allergens,
    COUNT(*) FILTER (WHERE allergens::text LIKE '%\\%' OR allergens::text LIKE '%["%') as items_needing_cleanup,
    COUNT(*) FILTER (WHERE allergens::text LIKE '{%}' AND allergens::text NOT LIKE '%\\%') as items_correct_format
FROM food_items;

-- 2. QUICK SAMPLE CHECK (only 3 items - instant results)
SELECT 
    id,
    name,
    LEFT(allergens::text, 50) as allergen_preview,
    CASE 
        WHEN allergens::text LIKE '{%}' AND allergens::text NOT LIKE '%\\%' THEN '✅ OK'
        ELSE '⚠️ Needs Fix'
    END as status
FROM food_items
WHERE allergens IS NOT NULL 
  AND allergens::text != '{}'
LIMIT 3;

-- 3. FINNISH ALLERGEN QUICK CHECK (indexed search if name column is indexed)
SELECT EXISTS (
    SELECT 1 
    FROM food_items 
    WHERE allergens::text ILIKE '%määritelty%' 
    LIMIT 1
) as has_finnish_allergens;

-- 4. SINGLE QUERY SUMMARY (all info in one fast query)
WITH quick_stats AS (
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE allergens IS NOT NULL) as with_allergens,
        COUNT(*) FILTER (
            WHERE allergens IS NOT NULL 
            AND (allergens::text LIKE '%\\%' OR allergens::text LIKE '%["%')
        ) as corrupted
    FROM food_items
)
SELECT 
    total,
    with_allergens,
    corrupted,
    CASE 
        WHEN corrupted = 0 THEN '✅ All Clean!'
        WHEN corrupted < 5 THEN '⚠️ Few Issues (' || corrupted || ' items)'
        ELSE '❌ Needs Cleanup (' || corrupted || ' items)'
    END as status
FROM quick_stats;