// =====================================================
// AUTHENTICATION SERVICE LAYER
// Handles all authentication operations with Supabase Auth
// =====================================================

import { supabase } from '@/lib/supabase/client';
import { 
  Profile, 
  ProfileInsert, 
  ProfileUpdate, 
  UserRole, 
  AuthResponse 
} from '@/types/supabase';
import type { User } from '@supabase/supabase-js';

export interface SignUpData {
  email: string;
  password: string;
  userData: {
    role: UserRole;
    full_name: string;
    organization_name?: string;
    contact_number?: string;
    address?: string;
    driver_instructions?: string;
  };
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  /**
   * Sign up a new user with profile data
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            ...data.userData,
          },
        },
      });

      if (authError) {
        return { data: null, error: authError.message };
      }

      if (!authData.user) {
        return { data: null, error: t('common.failed_to_create_user') };
      }

      // Get the created profile (created by database trigger)
      const profile = await this.getProfile(authData.user.id);
      
      if (!profile) {
        return { data: null, error: t('common.failed_to_create_user_profile') };
      }

      return { data: profile, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : t('common.unknown_error_occurred') 
      };
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return { data: null, error: authError.message };
      }

      if (!authData.user) {
        return { data: null, error: t('common.failed_to_sign_in') };
      }

      // Get the user's profile
      const profile = await this.getProfile(authData.user.id);
      
      if (!profile) {
        return { data: null, error: 'User profile not found' };
      }

      return { data: profile, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : t('common.unknown_error_occurred') 
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : t('common.unknown_error_occurred') 
      };
    }
  }

  /**
   * Get current user session and profile
   */
  async getCurrentUser(): Promise<Profile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return await this.getProfile(user.id);
    } catch (error) {
      console.error(t('common.error_getting_current_user'), error);
      return null;
    }
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error(t('common.error_fetching_profile'), error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(t('common.error_getting_profile'), error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: ProfileUpdate): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : t('common.unknown_error_occurred') 
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return { error: error?.message || null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : t('common.unknown_error_occurred') 
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      return { error: error?.message || null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : t('common.unknown_error_occurred') 
      };
    }
  }

  /**
   * Verify OTP (for email confirmation, password reset, etc.)
   */
  async verifyOtp(email: string, token: string, type: 'signup' | 'recovery' | 'email_change'): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });

      if (authError) {
        return { data: null, error: authError.message };
      }

      if (!authData.user) {
        return { data: null, error: t('common.failed_to_verify_otp') };
      }

      const profile = await this.getProfile(authData.user.id);
      
      if (!profile) {
        return { data: null, error: 'User profile not found' };
      }

      return { data: profile, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : t('common.unknown_error_occurred') 
      };
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(user: Profile | null, role: UserRole): boolean {
    return user?.role === role;
  }

  /**
   * Check if user is admin (city or terminals)
   */
  isAdmin(user: Profile | null): boolean {
    return user?.role === 'city' || user?.role === 'terminals';
  }

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback: (user: Profile | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getProfile(session.user.id);
        callback(profile);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error(t('common.error_getting_session'), error);
      return null;
    }
  }

  /**
   * Development helper: Quick login with email (for testing)
   */
  async devLogin(email: string): Promise<AuthResponse> {
    // In development, we'll simulate login by finding the user profile
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', `%${email.split('@')[0]}%`)
        .single();

      if (error || !profile) {
        return { data: null, error: 'User not found' };
      }

      return { data: profile, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error.message : t('common.unknown_error_occurred') 
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export types for convenience
export type { Profile, UserRole, AuthResponse };