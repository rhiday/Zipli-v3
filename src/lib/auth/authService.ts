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
  AuthResponse,
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
      console.log('🔐 AuthService.signUp - Starting signup with:', {
        email: data.email,
        userData: data.userData,
      });

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            ...data.userData,
          },
        },
      });

      console.log('🔐 AuthService.signUp - Supabase response:', {
        hasUser: !!authData?.user,
        userId: authData?.user?.id,
        error: authError,
        errorMessage: authError?.message,
        errorStatus: (authError as any)?.status,
        errorCode: (authError as any)?.code,
      });

      if (authError) {
        console.error('🔐 AuthService.signUp - Auth error details:', {
          message: authError.message,
          status: (authError as any)?.status,
          code: (authError as any)?.code,
          details: (authError as any)?.details,
          hint: (authError as any)?.hint,
          fullError: authError,
        });
        return { data: null, error: authError.message };
      }

      if (!authData.user) {
        console.error('🔐 AuthService.signUp - No user returned from Supabase');
        return { data: null, error: 'Failed to create user' };
      }

      // Get the created profile (created by database trigger)
      console.log(
        '🔐 AuthService.signUp - Fetching profile for user:',
        authData.user.id
      );
      const profile = await this.getProfile(authData.user.id);

      if (!profile) {
        console.error('🔐 AuthService.signUp - Profile not found after signup');
        return { data: null, error: 'Failed to create user profile' };
      }

      console.log('🔐 AuthService.signUp - Success! Profile:', profile);
      return { data: profile, error: null };
    } catch (error) {
      console.error('🔐 AuthService.signUp - Caught exception:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (authError) {
        return { data: null, error: authError.message };
      }

      if (!authData.user) {
        return { data: null, error: 'Failed to sign in' };
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
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
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
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get current user session and profile
   */
  async getCurrentUser(): Promise<Profile | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      return await this.getProfile(user.id);
    } catch (error) {
      console.error('Error getting current user', error);
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
        console.error('Error fetching profile', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting profile', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: ProfileUpdate
  ): Promise<{ data: Profile | null; error: string | null }> {
    try {
      console.log('🔄 AuthService.updateProfile - Starting update with:', {
        userId,
        updates,
      });

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      console.log('🔄 AuthService.updateProfile - Supabase response:', {
        data,
        error,
        hasData: !!data,
        errorMessage: error?.message,
        errorDetails: error?.details,
        errorHint: error?.hint,
        errorCode: (error as any)?.code,
      });

      if (error) {
        console.error('❌ AuthService.updateProfile - Database error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: (error as any)?.code,
          fullError: error,
        });
        return { data: null, error: error.message };
      }

      console.log(
        '✅ AuthService.updateProfile - Success! Updated profile:',
        data
      );
      return { data, error: null };
    } catch (error) {
      console.error('❌ AuthService.updateProfile - Caught exception:', error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
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
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      return { error: error?.message || null };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Verify OTP (for email confirmation, password reset, etc.)
   */
  async verifyOtp(
    email: string,
    token: string,
    type: 'signup' | 'recovery' | 'email_change'
  ): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.verifyOtp({
          email,
          token,
          type,
        });

      if (authError) {
        return { data: null, error: authError.message };
      }

      if (!authData.user) {
        return { data: null, error: 'Failed to verify OTP' };
      }

      const profile = await this.getProfile(authData.user.id);

      if (!profile) {
        return { data: null, error: 'User profile not found' };
      }

      return { data: profile, error: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Error getting session', error);
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
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export types for convenience
export type { Profile, UserRole, AuthResponse };
