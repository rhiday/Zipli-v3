#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vqtfcdnrgotgrnwwuryo.supabase.co';
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxdGZjZG5yZ290Z3Jud3d1cnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkwODM3NiwiZXhwIjoyMDYxNDg0Mzc2fQ.eMGevNQ3vZBr5hdGKfD7TcFBMJSGTDqnHV39K6bL8pk'; // This should be the service role key for schema changes

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addRequestColumns() {
  console.log('🔧 Adding missing columns to requests table...');

  try {
    // Execute the SQL to add missing columns
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add missing columns to requests table
        ALTER TABLE requests
        ADD COLUMN IF NOT EXISTS address TEXT,
        ADD COLUMN IF NOT EXISTS instructions TEXT,
        ADD COLUMN IF NOT EXISTS start_date DATE,
        ADD COLUMN IF NOT EXISTS end_date DATE,
        ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT;
        
        -- Add constraint to ensure end_date is after start_date (if both are provided)
        ALTER TABLE requests 
        DROP CONSTRAINT IF EXISTS check_request_date_range;
        
        ALTER TABLE requests 
        ADD CONSTRAINT check_request_date_range 
        CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date);
      `,
    });

    if (error) {
      console.error('❌ Error executing SQL:', error);
      // Try alternative approach
      console.log('🔄 Trying alternative approach...');

      const queries = [
        'ALTER TABLE requests ADD COLUMN IF NOT EXISTS address TEXT',
        'ALTER TABLE requests ADD COLUMN IF NOT EXISTS instructions TEXT',
        'ALTER TABLE requests ADD COLUMN IF NOT EXISTS start_date DATE',
        'ALTER TABLE requests ADD COLUMN IF NOT EXISTS end_date DATE',
        'ALTER TABLE requests ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT',
      ];

      for (const query of queries) {
        const { error: queryError } = await supabase.rpc('exec_sql', {
          sql: query,
        });
        if (queryError) {
          console.error(`❌ Error executing query "${query}":`, queryError);
        } else {
          console.log(`✅ Executed: ${query}`);
        }
      }

      return;
    }

    console.log('✅ Successfully added missing columns to requests table!');

    // Verify the columns were added
    const { data: columns, error: checkError } = await supabase.rpc(
      'exec_sql',
      {
        sql: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'requests' 
        AND column_name IN ('address', 'instructions', 'start_date', 'end_date', 'recurrence_pattern')
        ORDER BY column_name;
      `,
      }
    );

    if (checkError) {
      console.error('❌ Error checking columns:', checkError);
    } else if (columns) {
      console.log('📋 New columns added:');
      columns.forEach((col) => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the migration
addRequestColumns();
