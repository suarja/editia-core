/**
 * Database types for Editia Core
 * 
 * This file imports and re-exports the actual Supabase generated types
 * and provides utility functions for type safety and developer experience.
 */

// Import the actual Database type from the generated file
export type { Database } from './database.types';

// Re-export utility types from the generated file
export type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
} from './database.types';

// Import Database type for utility functions
import type { Database } from './database.types';

// ============================================================================
// TYPE MAPPING UTILITIES
// ============================================================================

/**
 * Extract table row type from Database
 */
export type TableRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

/**
 * Extract table insert type from Database
 */
export type TableInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

/**
 * Extract table update type from Database
 */
export type TableUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

/**
 * Extract enum type from Database
 */
export type DatabaseEnum<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T];

// ============================================================================
// ABSTRACTED TYPES (for better DX)
// ============================================================================

/**
 * Subscription plan identifier
 */
export type PlanIdentifier = 'free' | 'creator' | 'pro';

/**
 * User usage data - abstracted from user_usage table
 */
export interface UserUsage {
  user_id: string;
  current_plan_id: PlanIdentifier;
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
}

/**
 * Subscription plan data - abstracted from subscription_plans table
 */
export interface SubscriptionPlan {
  id: PlanIdentifier;
  name: string;
  description?: string;
  videos_generated_limit: number;
  source_videos_limit: number;
  voice_clones_limit: number;
  account_analysis_limit: number;
  is_unlimited: boolean;
  is_active?: boolean;
  created_at?: string;
}

/**
 * Feature flag data - abstracted from feature_flags table
 */
export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  required_plan: PlanIdentifier | null;
  is_active: boolean;
  created_at?: string;
}

/**
 * User data - abstracted from users table
 */
export interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  clerk_user_id: string;
  stripe_customer_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Editorial profile data - abstracted from editorial_profiles table
 */
export interface EditorialProfile {
  id: string;
  user_id: string;
  persona_description?: string;
  tone_of_voice?: string;
  audience?: string;
  content_examples?: any;
  style_notes?: string;
  created_at?: string;
}

/**
 * Voice clone data - abstracted from voice_clones table
 */
export interface VoiceClone {
  id: string;
  user_id: string;
  elevenlabs_voice_id?: string;
  name?: string;
  status?: 'pending' | 'ready' | 'error';
  sample_files?: any;
  created_at?: string;
}

/**
 * Video data - abstracted from videos table
 */
export interface Video {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  tags?: string[];
  upload_url?: string;
  duration_seconds?: number;
  created_at?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a plan identifier is valid
 */
export const isValidPlanIdentifier = (plan: string): plan is PlanIdentifier => {
  return ['free', 'creator', 'pro'].includes(plan);
};

/**
 * Get plan hierarchy level (for access control)
 */
export const getPlanLevel = (plan: PlanIdentifier): number => {
  const levels = { free: 0, creator: 1, pro: 2 };
  return levels[plan];
};

/**
 * Check if user has access to a required plan
 */
export const hasPlanAccess = (userPlan: PlanIdentifier, requiredPlan: PlanIdentifier): boolean => {
  return getPlanLevel(userPlan) >= getPlanLevel(requiredPlan);
};

/**
 * Calculate remaining usage for a resource
 */
export const calculateRemainingUsage = (used: number, limit: number): number => {
  return Math.max(0, limit - used);
};

/**
 * Check if user has reached their limit for a resource
 */
export const hasReachedLimit = (used: number, limit: number): boolean => {
  return used >= limit;
};

/**
 * Get usage percentage for a resource
 */
export const getUsagePercentage = (used: number, limit: number): number => {
  if (limit === 0) return 0;
  return Math.min(100, (used / limit) * 100);
}; 