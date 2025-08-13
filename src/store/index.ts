// =====================================================
// DATABASE STORE EXPORT
// Central export point for database store
// =====================================================

// Import the new Supabase-powered store
export { useSupabaseDatabase as useDatabase } from './supabaseDatabaseStore';

// Export types for compatibility
export type { 
  Profile as User,
  DonationWithFoodItem,
  UserRole,
  AuthResponse 
} from '@/types/supabase';

// Re-export for backward compatibility with existing components
export { useSupabaseDatabase } from './supabaseDatabaseStore';