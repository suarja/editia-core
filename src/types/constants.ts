/**
 * Editia Core Constants
 * 
 * This file contains all the constants used throughout the Editia Core package,
 * including plan limits, feature flags, and other configuration values.
 */

import type { PlanIdentifier } from './database';

// ============================================================================
// PLAN CONSTANTS
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
    script_conversations_limit: 10,
  },
  creator: {
    videos_generated_limit: 15,
    source_videos_limit: 50,
    voice_clones_limit: 1,
    account_analysis_limit: 4,
    script_conversations_limit: 100,
  },
  pro: {
    videos_generated_limit: -1, // unlimited
    source_videos_limit: -1, // unlimited
    voice_clones_limit: 2,
    account_analysis_limit: -1, // unlimited
    script_conversations_limit: -1, // unlimited
  },
} as const;

/**
 * Plan hierarchy for access control
 */
export const PLAN_HIERARCHY: Record<PlanIdentifier, number> = {
  free: 0,
  creator: 1,
  pro: 2,
} as const;

// ============================================================================
// FEATURE FLAG CONSTANTS
// ============================================================================

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
  SCRIPT_CONVERSATIONS: 'script_conversations',
} as const;

/**
 * Feature flag type
 */
export type FeatureFlagId = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];

// ============================================================================
// USAGE CONSTANTS
// ============================================================================

/**
 * Default usage reset periods (in days)
 */
export const USAGE_RESET_PERIODS = {
  videos_generated: 30,
  source_videos_used: 30,
  voice_clones_used: 30,
  account_analysis_used: 30,
  script_conversations_used: 30,
} as const;

/**
 * Usage warning thresholds (percentage)
 */
export const USAGE_WARNING_THRESHOLDS = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 90,
} as const;

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Maximum values for various limits
 */
export const MAXIMUM_LIMITS = {
  VIDEOS_GENERATED: 1000,
  SOURCE_VIDEOS: 10000,
  VOICE_CLONES: 10,
  ACCOUNT_ANALYSIS: 100,
  SCRIPT_CONVERSATIONS: 10000,
} as const;

/**
 * Minimum values for various limits
 */
export const MINIMUM_LIMITS = {
  VIDEOS_GENERATED: 0,
  SOURCE_VIDEOS: 0,
  VOICE_CLONES: 0,
  ACCOUNT_ANALYSIS: 0,
  SCRIPT_CONVERSATIONS: 0,
} as const;

// ============================================================================
// CACHE CONSTANTS
// ============================================================================

/**
 * Cache timeouts (in milliseconds)
 */
export const CACHE_TIMEOUTS = {
  USER_USAGE: 5 * 60 * 1000, // 5 minutes
  FEATURE_FLAGS: 10 * 60 * 1000, // 10 minutes
  SUBSCRIPTION_PLANS: 30 * 60 * 1000, // 30 minutes
  USER_PROFILE: 15 * 60 * 1000, // 15 minutes
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

/**
 * Standard error codes for monetization
 */
export const MONETIZATION_ERROR_CODES = {
  FEATURE_ACCESS_DENIED: 'FEATURE_ACCESS_DENIED',
  USAGE_LIMIT_REACHED: 'USAGE_LIMIT_REACHED',
  INVALID_FEATURE_ID: 'INVALID_FEATURE_ID',
  INVALID_ACTION: 'INVALID_ACTION',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  MONETIZATION_SERVICE_ERROR: 'MONETIZATION_SERVICE_ERROR',
  PLAN_UPGRADE_REQUIRED: 'PLAN_UPGRADE_REQUIRED',
} as const;

/**
 * Error code type
 */
export type MonetizationErrorCode = typeof MONETIZATION_ERROR_CODES[keyof typeof MONETIZATION_ERROR_CODES]; 