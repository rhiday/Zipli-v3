import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vqtfcdnrgotgrnwwuryo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxdGZjZG5yZ290Z3Jud3d1cnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MDgzNzYsImV4cCI6MjA2MTQ4NDM3Nn0.I2Qqp8BNeCxNHT9T03sbMROy_eKqXenj9QFibCmXdgk';

// Initialize the Supabase client with TypeScript support
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Export types for convenience
export type SupabaseClient = typeof supabase; 