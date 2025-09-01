# Database Migration Best Practices

## Overview

This document establishes **iron-strong** database migration practices to ensure data integrity and prevent production issues. These practices are mandatory for all database changes.

## Core Principle: Always Verify First

**Never apply a database migration without verification queries.** Every database change must follow the **"Verify → Migrate → Verify"** pattern.

## The 3-Step Migration Process

### Step 1: Pre-Migration Verification

Before making any changes, understand the current state:

```sql
-- Example: Before adding a new column
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'your_table';

-- Check if constraint already exists
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'your_table'
AND constraint_name = 'your_constraint_name';

-- Check current data patterns
SELECT
  column_name,
  COUNT(*) as total_rows,
  COUNT(column_name) as non_null_rows,
  COUNT(DISTINCT column_name) as unique_values
FROM your_table
GROUP BY column_name;
```

### Step 2: Safe Migration Execution

Always make migrations idempotent and safe:

```sql
-- ✅ GOOD: Check before adding column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'your_table'
        AND column_name = 'new_column'
    ) THEN
        ALTER TABLE your_table ADD COLUMN new_column JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- ✅ GOOD: Check before adding constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'your_constraint_name'
    ) THEN
        ALTER TABLE your_table
        ADD CONSTRAINT your_constraint_name CHECK (condition);
    END IF;
END $$;

-- ❌ BAD: Direct changes without checks
ALTER TABLE your_table ADD COLUMN new_column JSONB;  -- Will fail if exists
```

### Step 3: Post-Migration Verification

Confirm the migration worked correctly:

```sql
-- Verify structural changes
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'your_table'
AND column_name = 'new_column';

-- Verify data migration
SELECT
  original_column,
  new_column,
  CASE
    WHEN new_column IS NULL THEN 'MISSING'
    WHEN jsonb_typeof(new_column) = 'array' THEN 'VALID_ARRAY'
    ELSE 'INVALID_FORMAT'
  END as status
FROM your_table
WHERE original_column IS NOT NULL
LIMIT 5;

-- Verify constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'your_table';
```

## Common Migration Patterns

### Adding New Columns with Data Migration

```sql
-- 1. Pre-check: Does column exist?
SELECT COUNT(*) FROM information_schema.columns
WHERE table_name = 'food_items' AND column_name = 'image_urls';

-- 2. Add column safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'food_items'
        AND column_name = 'image_urls'
    ) THEN
        ALTER TABLE food_items ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 3. Migrate existing data
UPDATE food_items
SET image_urls = CASE
    WHEN image_url IS NOT NULL AND image_url != ''
    THEN jsonb_build_array(image_url)
    ELSE '[]'::jsonb
END
WHERE image_urls IS NULL OR image_urls = '[]'::jsonb;

-- 4. Verify migration success
SELECT
  name,
  image_url,
  image_urls,
  jsonb_array_length(image_urls) as image_count
FROM food_items
WHERE image_url IS NOT NULL
LIMIT 5;
```

### Adding Constraints Safely

```sql
-- Check if constraint exists first
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'your_table'
AND constraint_name = 'your_constraint';

-- Add constraint conditionally
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'image_urls_is_array'
    ) THEN
        ALTER TABLE food_items
        ADD CONSTRAINT image_urls_is_array
        CHECK (jsonb_typeof(image_urls) = 'array');
    END IF;
END $$;
```

## Migration Checklist

Before running any database migration:

- [ ] **Pre-verification queries written and tested**
- [ ] **Migration is idempotent** (safe to run multiple times)
- [ ] **Post-verification queries prepared**
- [ ] **Backup plan identified** (how to rollback if needed)
- [ ] **Impact assessment completed** (affects how many rows/tables)

During migration:

- [ ] **Run pre-verification queries first**
- [ ] **Execute migration step-by-step**
- [ ] **Run post-verification queries**
- [ ] **Test affected features in the app**

After migration:

- [ ] **Document what was changed**
- [ ] **Update type definitions if needed**
- [ ] **Test application functionality**
- [ ] **Monitor for any issues**

## Real Example: Multiple Image Upload Migration

This was successfully applied on 2025-08-31:

### Pre-Verification

```sql
-- Check if column exists
SELECT COUNT(*) FROM information_schema.columns
WHERE table_name = 'food_items' AND column_name = 'image_urls';
-- Result: 1 (column existed)

-- Check current data
SELECT COUNT(*) FROM food_items
WHERE image_urls IS NOT NULL AND image_urls != '[]'::jsonb;
-- Result: 0 (no migrated data yet)
```

### Migration

```sql
-- Migrate data from single image_url to image_urls array
UPDATE food_items
SET image_urls = CASE
    WHEN image_url IS NOT NULL AND image_url != ''
    THEN jsonb_build_array(image_url)
    ELSE '[]'::jsonb
END;

-- Add constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'image_urls_is_array'
    ) THEN
        ALTER TABLE food_items
        ADD CONSTRAINT image_urls_is_array
        CHECK (jsonb_typeof(image_urls) = 'array');
    END IF;
END $$;
```

### Post-Verification

```sql
-- Verify data migration
SELECT
  name,
  image_url,
  image_urls,
  jsonb_array_length(image_urls) as image_count
FROM food_items
WHERE image_url IS NOT NULL
LIMIT 5;
-- Result: All 5 items showed proper array format with migrated data

-- Verify constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'food_items'
AND constraint_name = 'image_urls_is_array';
-- Result: 1 row showing CHECK constraint exists
```

## Emergency Rollback Patterns

Always have a rollback plan:

```sql
-- Example rollback for column addition
ALTER TABLE your_table DROP COLUMN IF EXISTS new_column;

-- Example rollback for constraint
ALTER TABLE your_table DROP CONSTRAINT IF EXISTS constraint_name;

-- Example rollback for data migration
UPDATE your_table SET old_column = new_column WHERE condition;
UPDATE your_table SET new_column = NULL;
```

## Tools and Environment

- **Supabase SQL Editor**: Primary tool for running migrations
- **Local Development**: Use `npx supabase migration up` when Docker is available
- **Staging Environment**: Always test migrations on staging first
- **Monitoring**: Watch application logs after migrations

## Why This Approach Makes Us "Iron Strong"

1. **No Surprises**: Pre-verification tells us exactly what will happen
2. **No Failures**: Idempotent migrations can't break from re-runs
3. **No Data Loss**: Post-verification confirms everything worked
4. **No Downtime**: Safe migrations don't lock tables or break apps
5. **No Guessing**: Documentation captures exactly what was done

## Remember

> "Measure twice, cut once" - but for databases it's "Verify twice, migrate once"

Every database change should be predictable, reversible, and verifiable. This approach has successfully handled complex migrations like the multiple image upload feature without any issues.
