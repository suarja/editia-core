/**
 * Database types for Editia Core
 * To be implemented with Supabase type generation
 */

// Placeholder types - will be replaced by generated Supabase types
export interface Database {
  public: {
    Tables: Tables;
    Views: Views;
    Functions: Functions;
  };
}

export interface Tables {
  users: UsersTable;
  feature_flags: FeatureFlagsTable;
  user_usage: UserUsageTable;
  subscription_plans: SubscriptionPlansTable;
  [key: string]: unknown;
}

export interface Views {
  [key: string]: unknown;
}

export interface Functions {
  [key: string]: unknown;
}

// Table definitions (simplified)
export interface UsersTable {
  Row: {
    id: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
    clerk_user_id: string;
    subscription_tier?: string;
    created_at?: string;
    updated_at?: string;
  };
  Insert: {
    id?: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
    clerk_user_id: string;
    subscription_tier?: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    email?: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
    clerk_user_id?: string;
    subscription_tier?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface FeatureFlagsTable {
  Row: {
    id: string;
    name: string;
    description?: string;
    required_plan: string | null;
    is_active: boolean;
    created_at?: string;
  };
  Insert: {
    id: string;
    name: string;
    description?: string;
    required_plan?: string | null;
    is_active?: boolean;
    created_at?: string;
  };
  Update: {
    id?: string;
    name?: string;
    description?: string;
    required_plan?: string | null;
    is_active?: boolean;
    created_at?: string;
  };
}

export interface UserUsageTable {
  Row: {
    user_id: string;
    current_plan_id: string;
    videos_generated: number;
    videos_generated_limit: number;
    source_videos_used: number;
    source_videos_limit: number;
    voice_clones_used: number;
    voice_clones_limit: number;
    account_analysis_used: number;
    account_analysis_limit: number;
    next_reset_date: string;
    created_at?: string;
    updated_at?: string;
  };
  Insert: {
    user_id: string;
    current_plan_id: string;
    videos_generated?: number;
    videos_generated_limit: number;
    source_videos_used?: number;
    source_videos_limit: number;
    voice_clones_used?: number;
    voice_clones_limit: number;
    account_analysis_used?: number;
    account_analysis_limit: number;
    next_reset_date: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    user_id?: string;
    current_plan_id?: string;
    videos_generated?: number;
    videos_generated_limit?: number;
    source_videos_used?: number;
    source_videos_limit?: number;
    voice_clones_used?: number;
    voice_clones_limit?: number;
    account_analysis_used?: number;
    account_analysis_limit?: number;
    next_reset_date?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface SubscriptionPlansTable {
  Row: {
    id: string;
    name: string;
    description?: string;
    videos_generated_limit: number;
    source_videos_limit: number;
    voice_clones_limit: number;
    account_analysis_limit: number;
    is_unlimited: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Insert: {
    id: string;
    name: string;
    description?: string;
    videos_generated_limit: number;
    source_videos_limit: number;
    voice_clones_limit: number;
    account_analysis_limit: number;
    is_unlimited: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    name?: string;
    description?: string;
    videos_generated_limit?: number;
    source_videos_limit?: number;
    voice_clones_limit?: number;
    account_analysis_limit?: number;
    is_unlimited?: boolean;
    created_at?: string;
    updated_at?: string;
  };
} 