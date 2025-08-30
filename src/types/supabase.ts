export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      city_monthly_data: {
        Row: {
          created_at: string | null;
          donated: number;
          id: string;
          month: string;
          month_number: number;
          total: number;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          donated: number;
          id?: string;
          month: string;
          month_number: number;
          total: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          donated?: number;
          id?: string;
          month?: string;
          month_number?: number;
          total?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'city_monthly_data_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      city_stats: {
        Row: {
          created_at: string | null;
          icon: string;
          id: number;
          label: string;
          updated_at: string | null;
          user_id: string;
          value: string;
        };
        Insert: {
          created_at?: string | null;
          icon: string;
          id: number;
          label: string;
          updated_at?: string | null;
          user_id: string;
          value: string;
        };
        Update: {
          created_at?: string | null;
          icon?: string;
          id?: number;
          label?: string;
          updated_at?: string | null;
          user_id?: string;
          value?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_city_stats_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      climate_goals: {
        Row: {
          created_at: string | null;
          id: string;
          percentage: number;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          percentage: number;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          percentage?: number;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      donations: {
        Row: {
          claimed_at: string | null;
          created_at: string;
          donor_id: string;
          food_item_id: string;
          id: string;
          instructions_for_driver: string | null;
          picked_up_at: string | null;
          pickup_slots: Json | null;
          pickup_time: string | null;
          quantity: number;
          receiver_id: string | null;
          status: Database['public']['Enums']['donation_status'];
          unit: string | null;
          updated_at: string;
        };
        Insert: {
          claimed_at?: string | null;
          created_at?: string;
          donor_id: string;
          food_item_id: string;
          id?: string;
          instructions_for_driver?: string | null;
          picked_up_at?: string | null;
          pickup_slots?: Json | null;
          pickup_time?: string | null;
          quantity?: number;
          receiver_id?: string | null;
          status?: Database['public']['Enums']['donation_status'];
          unit?: string | null;
          updated_at?: string;
        };
        Update: {
          claimed_at?: string | null;
          created_at?: string;
          donor_id?: string;
          food_item_id?: string;
          id?: string;
          instructions_for_driver?: string | null;
          picked_up_at?: string | null;
          pickup_slots?: Json | null;
          pickup_time?: string | null;
          quantity?: number;
          receiver_id?: string | null;
          status?: Database['public']['Enums']['donation_status'];
          unit?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'donations_donor_id_fkey';
            columns: ['donor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'donations_food_item_id_fkey';
            columns: ['food_item_id'];
            isOneToOne: false;
            referencedRelation: 'food_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'donations_receiver_id_fkey';
            columns: ['receiver_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      food_items: {
        Row: {
          allergens: string | null;
          created_at: string;
          description: string | null;
          donor_id: string | null;
          food_type: string | null;
          id: string;
          image_url: string | null;
          name: string;
          quantity: number;
          unit: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          allergens?: string | null;
          created_at?: string;
          description?: string | null;
          donor_id?: string | null;
          food_type?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          quantity?: number;
          unit?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          allergens?: string | null;
          created_at?: string;
          description?: string | null;
          donor_id?: string | null;
          food_type?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          quantity?: number;
          unit?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_food_items_donor_id';
            columns: ['donor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_food_items_user_id';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          address: string | null;
          city: string | null;
          contact_number: string | null;
          country: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          organization_name: string;
          postal_code: string | null;
          role: Database['public']['Enums']['user_role'];
          street_address: string | null;
          updated_at: string;
          driver_instructions: string | null;
        };
        Insert: {
          address?: string | null;
          city?: string | null;
          contact_number?: string | null;
          country?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          organization_name: string;
          postal_code?: string | null;
          role: Database['public']['Enums']['user_role'];
          street_address?: string | null;
          updated_at?: string;
          driver_instructions?: string | null;
        };
        Update: {
          address?: string | null;
          city?: string | null;
          contact_number?: string | null;
          country?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          organization_name?: string;
          postal_code?: string | null;
          role?: Database['public']['Enums']['user_role'];
          street_address?: string | null;
          updated_at?: string;
          driver_instructions?: string | null;
        };
        Relationships: [];
      };
      recommended_actions: {
        Row: {
          action: string;
          created_at: string | null;
          description: string;
          id: number;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          description: string;
          id: number;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          description?: string;
          id?: number;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      requests: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          is_recurring: boolean;
          people_count: number;
          pickup_date: string;
          pickup_end_time: string;
          pickup_instructions: string | null;
          pickup_start_time: string;
          status: Database['public']['Enums']['request_status'];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          is_recurring?: boolean;
          people_count?: number;
          pickup_date: string;
          pickup_end_time: string;
          pickup_instructions?: string | null;
          pickup_start_time: string;
          status?: Database['public']['Enums']['request_status'];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          is_recurring?: boolean;
          people_count?: number;
          pickup_date?: string;
          pickup_end_time?: string;
          pickup_instructions?: string | null;
          pickup_start_time?: string;
          status?: Database['public']['Enums']['request_status'];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'requests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      surplus_breakdown: {
        Row: {
          category: string;
          created_at: string | null;
          id: string;
          percentage: number;
          updated_at: string | null;
        };
        Insert: {
          category: string;
          created_at?: string | null;
          id?: string;
          percentage: number;
          updated_at?: string | null;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          id?: string;
          percentage?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      initialize_dashboard_data: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      refresh_dashboard_data: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      donation_status: 'available' | 'claimed' | 'picked_up' | 'cancelled';
      request_recurrence_pattern:
        | 'daily'
        | 'weekly'
        | 'bi-weekly'
        | 'monthly'
        | 'one-time';
      request_status: 'active' | 'fulfilled' | 'cancelled';
      user_role: 'food_donor' | 'food_receiver' | 'city' | 'terminals';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      donation_status: ['available', 'claimed', 'picked_up', 'cancelled'],
      request_recurrence_pattern: [
        'daily',
        'weekly',
        'bi-weekly',
        'monthly',
        'one-time',
      ],
      request_status: ['active', 'fulfilled', 'cancelled'],
      user_role: ['food_donor', 'food_receiver', 'city', 'terminals'],
    },
  },
} as const;

// Helper types for easier usage
export type UserRole = Database['public']['Enums']['user_role'];
export type DonationStatus = Database['public']['Enums']['donation_status'];
export type RequestStatus = Database['public']['Enums']['request_status'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type FoodItem = Database['public']['Tables']['food_items']['Row'];
export type FoodItemInsert =
  Database['public']['Tables']['food_items']['Insert'];
export type FoodItemUpdate =
  Database['public']['Tables']['food_items']['Update'];

export type Donation = Database['public']['Tables']['donations']['Row'];
export type DonationInsert =
  Database['public']['Tables']['donations']['Insert'];
export type DonationUpdate =
  Database['public']['Tables']['donations']['Update'];

export type Request = Database['public']['Tables']['requests']['Row'];
export type RequestInsert = Database['public']['Tables']['requests']['Insert'];
export type RequestUpdate = Database['public']['Tables']['requests']['Update'];

// Extended types with relationships
export type DonationWithFoodItem = Donation & {
  food_item: FoodItem;
  donor: Profile;
  receiver?: Profile;
};

export type RequestWithUser = Request & {
  user: Profile;
};

// Auth types
export interface AuthResponse {
  data: Profile | null;
  error: string | null;
}
