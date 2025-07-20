/**
 * Compatibility Layer for Editia Core Types
 * 
 * This file provides backward compatibility for existing code while
 * encouraging migration to the new strongly-typed system.
 */

import type { FeatureId, Action, UsageField } from './monetization';
import type { UserUsage as NewUserUsage } from './usage-tracking';
import { FEATURES, ACTIONS, USAGE_FIELDS } from './monetization';

// ============================================================================
// TYPE ALIASES FOR BACKWARD COMPATIBILITY
// ============================================================================

/**
 * @deprecated Use FeatureId instead
 */
export type FeatureIdLegacy = string;

/**
 * @deprecated Use Action instead
 */
export type ActionLegacy = 'video_generation' | 'source_video_upload' | 'voice_clone' | 'account_analysis' | 'script_conversations';

/**
 * @deprecated Use UsageField instead
 */
export type UsageFieldLegacy = 'videos_generated' | 'source_videos_used' | 'voice_clones_used' | 'account_analysis_used' | 'script_conversations_used';

/**
 * @deprecated Use UserUsage from './usage-tracking' instead
 */
export interface UserUsageLegacy {
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
  script_conversations_used: number;
  script_conversations_limit: number;
  next_reset_date: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// COMPATIBILITY FUNCTIONS
// ============================================================================

/**
 * Convert legacy string to FeatureId with validation
 * @deprecated Use FEATURES constants directly
 */
export function toFeatureId(legacyFeature: string): FeatureId {
  if (Object.values(FEATURES).includes(legacyFeature as FeatureId)) {
    return legacyFeature as FeatureId;
  }
  
  // Fallback mappings for common legacy values
  const fallbackMap: Record<string, FeatureId> = {
    'video_generation': FEATURES.VIDEO_GENERATION,
    'source_videos': FEATURES.SOURCE_VIDEOS,
    'voice_clone': FEATURES.VOICE_CLONE,
    'account_analysis': FEATURES.ACCOUNT_ANALYSIS,
    'script_conversations': FEATURES.SCRIPT_CONVERSATIONS,
    'script_generation': FEATURES.SCRIPT_GENERATION,
    'chat_ai': FEATURES.CHAT_AI,
  };
  
  return fallbackMap[legacyFeature] || FEATURES.VIDEO_GENERATION;
}

/**
 * Convert legacy string to Action with validation
 * @deprecated Use ACTIONS constants directly
 */
export function toAction(legacyAction: string): Action {
  if (Object.values(ACTIONS).includes(legacyAction as Action)) {
    return legacyAction as Action;
  }
  
  // Fallback mappings for common legacy values
  const fallbackMap: Record<string, Action> = {
    'video_generation': ACTIONS.VIDEO_GENERATION,
    'source_video_upload': ACTIONS.SOURCE_VIDEO_UPLOAD,
    'voice_clone': ACTIONS.VOICE_CLONE,
    'account_analysis': ACTIONS.ACCOUNT_ANALYSIS,
    'script_conversations': ACTIONS.SCRIPT_CONVERSATIONS,
  };
  
  return fallbackMap[legacyAction] || ACTIONS.VIDEO_GENERATION;
}

/**
 * Convert legacy string to UsageField with validation
 * @deprecated Use USAGE_FIELDS constants directly
 */
export function toUsageField(legacyField: string): UsageField {
  if (Object.values(USAGE_FIELDS).includes(legacyField as UsageField)) {
    return legacyField as UsageField;
  }
  
  // Fallback mappings for common legacy values
  const fallbackMap: Record<string, UsageField> = {
    'videos_generated': USAGE_FIELDS.VIDEOS_GENERATED,
    'source_videos_used': USAGE_FIELDS.SOURCE_VIDEOS_USED,
    'voice_clones_used': USAGE_FIELDS.VOICE_CLONES_USED,
    'account_analysis_used': USAGE_FIELDS.ACCOUNT_ANALYSIS_USED,
    'script_conversations_used': USAGE_FIELDS.SCRIPT_CONVERSATIONS_USED,
  };
  
  return fallbackMap[legacyField] || USAGE_FIELDS.VIDEOS_GENERATED;
}

/**
 * Convert new UserUsage to legacy format
 * @deprecated Use new UserUsage type directly
 */
export function toLegacyUserUsage(newUsage: NewUserUsage): UserUsageLegacy {
  return {
    user_id: newUsage.user_id,
    current_plan_id: newUsage.current_plan_id,
    videos_generated: newUsage.videos_generated,
    videos_generated_limit: newUsage.videos_generated_limit,
    source_videos_used: newUsage.source_videos_used,
    source_videos_limit: newUsage.source_videos_limit,
    voice_clones_used: newUsage.voice_clones_used,
    voice_clones_limit: newUsage.voice_clones_limit,
    account_analysis_used: newUsage.account_analysis_used,
    account_analysis_limit: newUsage.account_analysis_limit,
    script_conversations_used: newUsage.script_conversations_used,
    script_conversations_limit: newUsage.script_conversations_limit,
    next_reset_date: newUsage.next_reset_date,
    created_at: newUsage.created_at,
    updated_at: newUsage.updated_at,
  };
}

// ============================================================================
// DEPRECATION WARNINGS
// ============================================================================

/**
 * Show deprecation warning in development
 */
export function showDeprecationWarning(oldUsage: string, newUsage: string) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️  DEPRECATION WARNING: ${oldUsage} is deprecated. Use ${newUsage} instead.`);
  }
}

// ============================================================================
// LEGACY CONSTANTS (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use FEATURES constants instead
 */
export const LEGACY_FEATURES = {
  VIDEO_GENERATION: 'video_generation',
  SOURCE_VIDEOS: 'source_videos',
  VOICE_CLONE: 'voice_clone',
  ACCOUNT_ANALYSIS: 'account_analysis',
  SCRIPT_CONVERSATIONS: 'script_conversations',
  SCRIPT_GENERATION: 'script_generation',
  CHAT_AI: 'chat_ai',
} as const;

/**
 * @deprecated Use ACTIONS constants instead
 */
export const LEGACY_ACTIONS = {
  VIDEO_GENERATION: 'video_generation',
  SOURCE_VIDEO_UPLOAD: 'source_video_upload',
  VOICE_CLONE: 'voice_clone',
  ACCOUNT_ANALYSIS: 'account_analysis',
  SCRIPT_CONVERSATIONS: 'script_conversations',
} as const; 