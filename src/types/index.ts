/**
 * Editia Core Types - Main Export
 * 
 * This file provides a clean, organized export of all types and utilities
 * for the Editia Core package.
 */

// ============================================================================
// CORE TYPES
// ============================================================================

// Database and mapping types
export type { Database } from './database';
export type {
  TableRow,
  TableInsert,
  TableUpdate,
  DatabaseEnum,
} from './database';

// ============================================================================
// ABSTRACTED TYPES
// ============================================================================

// Monetization types
export type {
  PlanIdentifier,
  UserUsage,
  SubscriptionPlan,
  FeatureFlag,
} from './database';

// Authentication types
export type { User } from './database';

// Content types
export type {
  EditorialProfile,
  VoiceClone,
  Video,
} from './database';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Type validation and access control
export {
  isValidPlanIdentifier,
  getPlanLevel,
  hasPlanAccess,
} from './database';

// Usage calculation utilities
export {
  calculateRemainingUsage,
  hasReachedLimit,
  getUsagePercentage,
} from './database';

// ============================================================================
// TYPE GUARDS
// ============================================================================

// Import types for type guards
import type { User, UserUsage, SubscriptionPlan, FeatureFlag } from './database';

/**
 * Type guard to check if an object is a valid User
 */
export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.id === 'string' && typeof obj.clerk_user_id === 'string';
};

/**
 * Type guard to check if an object is a valid UserUsage
 */
export const isUserUsage = (obj: any): obj is UserUsage => {
  return obj && 
    typeof obj.user_id === 'string' && 
    typeof obj.current_plan_id === 'string' &&
    typeof obj.videos_generated === 'number';
};

/**
 * Type guard to check if an object is a valid SubscriptionPlan
 */
export const isSubscriptionPlan = (obj: any): obj is SubscriptionPlan => {
  return obj && 
    typeof obj.id === 'string' && 
    typeof obj.name === 'string' &&
    typeof obj.videos_generated_limit === 'number';
};

/**
 * Type guard to check if an object is a valid FeatureFlag
 */
export const isFeatureFlag = (obj: any): obj is FeatureFlag => {
  return obj && 
    typeof obj.id === 'string' && 
    typeof obj.name === 'string' &&
    typeof obj.is_active === 'boolean';
};

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default plan limits for new users
 */
export const DEFAULT_PLAN_LIMITS = {
  free: {
    videos_generated_limit: 1,
    source_videos_limit: 5,
    voice_clones_limit: 0,
    account_analysis_limit: 1,
  },
  creator: {
    videos_generated_limit: 15,
    source_videos_limit: 50,
    voice_clones_limit: 1,
    account_analysis_limit: 4,
  },
  pro: {
    videos_generated_limit: -1, // unlimited
    source_videos_limit: -1, // unlimited
    voice_clones_limit: 2,
    account_analysis_limit: -1, // unlimited
  },
} as const;

/**
 * Plan hierarchy for access control
 */
export const PLAN_HIERARCHY = {
  free: 0,
  creator: 1,
  pro: 2,
} as const;

/**
 * Feature flag IDs for common features
 */
export const FEATURE_FLAGS = {
  ACCOUNT_ANALYSIS: 'account_analysis',
  CHAT_AI: 'chat_ai',
  SCRIPT_GENERATION: 'script_generation',
  VIDEO_GENERATION: 'video_generation',
  SOURCE_VIDEOS: 'source_videos',
  ADVANCED_SUBTITLES: 'advanced_subtitles',
  VOICE_CLONE: 'voice_clone',
  MULTIPLE_VOICES: 'multiple_voices',
  NICHE_ANALYSIS: 'niche_analysis',
  CONTENT_IDEAS: 'content_ideas',
  SCHEDULING: 'scheduling',
} as const; 