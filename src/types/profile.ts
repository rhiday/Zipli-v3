import type { Profile as BaseProfile } from './supabase';

// Update the Profile type to include driver_instructions
export interface Profile extends Omit<BaseProfile, 'driver_instructions'> {
  driver_instructions?: string | null;
}

// Update the ProfileUpdate type
export type ProfileUpdate = Partial<Profile>;
