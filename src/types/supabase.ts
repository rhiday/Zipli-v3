// =====================================================
// SUPABASE DATABASE TYPES
// Generated from database schema for type safety
// =====================================================

export type UserRole = 'food_donor' | 'food_receiver' | 'city' | 'terminals';
export type DonationStatus = 'available' | 'claimed' | 'completed' | 'cancelled';
export type RequestStatus = 'active' | 'fulfilled' | 'cancelled'; 
export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'completed';

// Database table types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          organization_name: string | null;
          contact_number: string | null;
          address: string | null;
          driver_instructions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name: string;
          organization_name?: string | null;
          contact_number?: string | null;
          address?: string | null;
          driver_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          organization_name?: string | null;
          contact_number?: string | null;
          address?: string | null;
          driver_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      food_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          allergens: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          allergens?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          allergens?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      donations: {
        Row: {
          id: string;
          food_item_id: string;
          donor_id: string;
          quantity: number;
          status: DonationStatus;
          pickup_time: string | null;
          pickup_slots: any; // JSON type
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          food_item_id: string;
          donor_id: string;
          quantity: number;
          status?: DonationStatus;
          pickup_time?: string | null;
          pickup_slots?: any;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          food_item_id?: string;
          donor_id?: string;
          quantity?: number;
          status?: DonationStatus;
          pickup_time?: string | null;
          pickup_slots?: any;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      requests: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          people_count: number;
          pickup_date: string;
          pickup_start_time: string;
          pickup_end_time: string;
          is_recurring: boolean;
          status: RequestStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          people_count: number;
          pickup_date: string;
          pickup_start_time: string;
          pickup_end_time: string;
          is_recurring?: boolean;
          status?: RequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          people_count?: number;
          pickup_date?: string;
          pickup_start_time?: string;
          pickup_end_time?: string;
          is_recurring?: boolean;
          status?: RequestStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      donation_claims: {
        Row: {
          id: string;
          donation_id: string;
          receiver_id: string;
          status: ClaimStatus;
          message: string | null;
          claimed_at: string;
          approved_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          donation_id: string;
          receiver_id: string;
          status?: ClaimStatus;
          message?: string | null;
          claimed_at?: string;
          approved_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          donation_id?: string;
          receiver_id?: string;
          status?: ClaimStatus;
          message?: string | null;
          claimed_at?: string;
          approved_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      city_donation_stats: {
        Row: {
          total_donations: number;
          available_donations: number;
          completed_donations: number;
          total_kg_donated: number | null;
          active_donors: number;
          month: string;
        };
      };
      city_request_stats: {
        Row: {
          total_requests: number;
          active_requests: number;
          fulfilled_requests: number;
          people_served: number | null;
          active_receivers: number;
          month: string;
        };
      };
      partner_organizations: {
        Row: {
          id: string;
          full_name: string;
          organization_name: string | null;
          role: UserRole;
          donation_count: number;
          total_kg_donated: number | null;
          last_donation_date: string | null;
        };
      };
    };
    Functions: {
      user_has_role: {
        Args: { required_role: UserRole };
        Returns: boolean;
      };
      user_is_admin: {
        Args: {};
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      donation_status: DonationStatus;
      request_status: RequestStatus;
      claim_status: ClaimStatus;
    };
  };
}

// Convenience types for application use
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type FoodItem = Database['public']['Tables']['food_items']['Row'];
export type FoodItemInsert = Database['public']['Tables']['food_items']['Insert'];
export type FoodItemUpdate = Database['public']['Tables']['food_items']['Update'];

export type Donation = Database['public']['Tables']['donations']['Row'];
export type DonationInsert = Database['public']['Tables']['donations']['Insert'];
export type DonationUpdate = Database['public']['Tables']['donations']['Update'];

export type Request = Database['public']['Tables']['requests']['Row'];
export type RequestInsert = Database['public']['Tables']['requests']['Insert'];
export type RequestUpdate = Database['public']['Tables']['requests']['Update'];

export type DonationClaim = Database['public']['Tables']['donation_claims']['Row'];
export type DonationClaimInsert = Database['public']['Tables']['donation_claims']['Insert'];
export type DonationClaimUpdate = Database['public']['Tables']['donation_claims']['Update'];

// Combined types for application logic
export interface DonationWithFoodItem extends Donation {
  food_item: FoodItem;
  donor?: Profile;
}

export interface RequestWithUser extends Request {
  user: Profile;
}

export interface DonationClaimWithDetails extends DonationClaim {
  donation: DonationWithFoodItem;
  receiver: Profile;
}

// City analytics types
export type CityDonationStats = Database['public']['Views']['city_donation_stats']['Row'];
export type CityRequestStats = Database['public']['Views']['city_request_stats']['Row'];
export type PartnerOrganization = Database['public']['Views']['partner_organizations']['Row'];

// Authentication types (compatible with existing mock auth)
export interface AuthResponse {
  data: { user: Profile } | null;
  error: string | null;
}

export interface AuthError {
  message: string;
}