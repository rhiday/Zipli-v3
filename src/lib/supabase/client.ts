import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqtfcdnrgotgrnwwuryo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxdGZjZG5yZ290Z3Jud3d1cnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MDgzNzYsImV4cCI6MjA2MTQ4NDM3Nn0.I2Qqp8BNeCxNHT9T03sbMROy_eKqXenj9QFibCmXdgk';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
}); 