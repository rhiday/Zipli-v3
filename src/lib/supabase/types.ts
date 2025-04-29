export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      donations: {
        Row: {
          claimed_at: string | null
          created_at: string
          donor_id: string
          food_item_id: string
          id: string
          picked_up_at: string | null
          pickup_time_end: string | null
          pickup_time_start: string | null
          quantity: number
          receiver_id: string | null
          status: Database["public"]["Enums"]["donation_status"]
          updated_at: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          donor_id: string
          food_item_id: string
          id?: string
          picked_up_at?: string | null
          pickup_time_end?: string | null
          pickup_time_start?: string | null
          quantity?: number
          receiver_id?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          updated_at?: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          donor_id?: string
          food_item_id?: string
          id?: string
          picked_up_at?: string | null
          pickup_time_end?: string | null
          pickup_time_start?: string | null
          quantity?: number
          receiver_id?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
          updated_at?: string
        }
      }
      food_items: {
        Row: {
          created_at: string
          description: string | null
          donor_id: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          donor_id?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          donor_id?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
      }
    }
    Enums: {
      donation_status: "available" | "claimed" | "picked_up" | "cancelled"
      user_role: "donor" | "receiver"
    }
  }
}

// Convenience types for each table
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type FoodItem = Database["public"]["Tables"]["food_items"]["Row"]
export type Donation = Database["public"]["Tables"]["donations"]["Row"]

// Enum types
export type UserRole = Database["public"]["Enums"]["user_role"]
export type DonationStatus = Database["public"]["Enums"]["donation_status"] 