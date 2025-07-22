/**
 * Monetization types for Editia Core
 * 
 * This file defines strict types for all monetization-related concepts:
 * - Feature identifiers
 * - Action types
 * - Usage tracking
 * - Plan management
 */

import { PlanIdentifier } from './database';

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * All available features in the system
 */
export const FEATURES = {
  // Video generation features
  VIDEO_GENERATION: 'video_generation',
  SOURCE_VIDEOS: 'source_videos',
  
  // Voice features
  VOICE_CLONE: 'voice_clone',
  
  // Analysis features
  ACCOUNT_ANALYSIS: 'account_analysis',
  ACCOUNT_INSIGHTS: 'account_insights',
  ACCOUNT_CHAT: 'account_chat',
  
  // Script features
  SCRIPT_CONVERSATIONS: 'script_conversations',
  SCRIPT_GENERATION: 'script_generation',
  
  // Chat features
  CHAT_AI: 'chat_ai',
} as const;

/**
 * Feature identifier type
 */
export type FeatureId = typeof FEATURES[keyof typeof FEATURES];

/**
 * All available actions that can be performed
 */
export const ACTIONS = {
  // Video actions
  VIDEO_GENERATION: 'video_generation',
  SOURCE_VIDEO_UPLOAD: 'source_video_upload',
  
  // Voice actions
  VOICE_CLONE: 'voice_clone',
  
  // Analysis actions
  ACCOUNT_ANALYSIS: 'account_analysis',
  ACCOUNT_INSIGHTS: 'account_insights',
  ACCOUNT_CHAT: 'account_chat',
  // Script actions
  SCRIPT_CONVERSATIONS: 'script_conversations',
} as const;

/**
 * Action type
 */
export type Action = typeof ACTIONS[keyof typeof ACTIONS];

/**
 * Usage tracking fields in the database
 */
export const USAGE_FIELDS = {
  VIDEOS_GENERATED: 'videos_generated',
  SOURCE_VIDEOS_USED: 'source_videos_used',
  VOICE_CLONES_USED: 'voice_clones_used',
  ACCOUNT_ANALYSIS_USED: 'account_analysis_used',
  ACCOUNT_INSIGHTS_USED: 'account_insights_used',
  SCRIPT_CONVERSATIONS_USED: 'script_conversations_used',
  ACCOUNT_CHAT_USED: 'account_chat_used',
} as const;

/**
 * Usage field type
 */
export type UsageField = typeof USAGE_FIELDS[keyof typeof USAGE_FIELDS];

// ============================================================================
// MAPPING TYPES
// ============================================================================

/**
 * Maps features to their corresponding actions
 */
export const FEATURE_TO_ACTION_MAP: Record<FeatureId, Action> = {
  [FEATURES.VIDEO_GENERATION]: ACTIONS.VIDEO_GENERATION,
  [FEATURES.SOURCE_VIDEOS]: ACTIONS.SOURCE_VIDEO_UPLOAD,
  [FEATURES.VOICE_CLONE]: ACTIONS.VOICE_CLONE,
  [FEATURES.ACCOUNT_ANALYSIS]: ACTIONS.ACCOUNT_ANALYSIS,
  [FEATURES.ACCOUNT_INSIGHTS]: ACTIONS.ACCOUNT_INSIGHTS,
  [FEATURES.SCRIPT_CONVERSATIONS]: ACTIONS.SCRIPT_CONVERSATIONS,
  [FEATURES.SCRIPT_GENERATION]: ACTIONS.SCRIPT_CONVERSATIONS, // Same action as conversations
  [FEATURES.CHAT_AI]: ACTIONS.SCRIPT_CONVERSATIONS, // Chat AI uses script conversations
  [FEATURES.ACCOUNT_CHAT]: ACTIONS.ACCOUNT_CHAT,
} as const;

/**
 * Maps actions to their corresponding usage fields
 */
export const ACTION_TO_USAGE_FIELD_MAP: Record<Action, UsageField> = {
  [ACTIONS.VIDEO_GENERATION]: USAGE_FIELDS.VIDEOS_GENERATED,
  [ACTIONS.SOURCE_VIDEO_UPLOAD]: USAGE_FIELDS.SOURCE_VIDEOS_USED,
  [ACTIONS.VOICE_CLONE]: USAGE_FIELDS.VOICE_CLONES_USED,
  [ACTIONS.ACCOUNT_ANALYSIS]: USAGE_FIELDS.ACCOUNT_ANALYSIS_USED,
  [ACTIONS.ACCOUNT_INSIGHTS]: USAGE_FIELDS.ACCOUNT_INSIGHTS_USED,
  [ACTIONS.SCRIPT_CONVERSATIONS]: USAGE_FIELDS.SCRIPT_CONVERSATIONS_USED,
  [ACTIONS.ACCOUNT_CHAT]: USAGE_FIELDS.ACCOUNT_CHAT_USED,
} as const;

/**
 * Maps features to their corresponding usage fields
 */
export const FEATURE_TO_USAGE_FIELD_MAP: Record<FeatureId, UsageField> = {
  [FEATURES.VIDEO_GENERATION]: USAGE_FIELDS.VIDEOS_GENERATED,
  [FEATURES.SOURCE_VIDEOS]: USAGE_FIELDS.SOURCE_VIDEOS_USED,
  [FEATURES.VOICE_CLONE]: USAGE_FIELDS.VOICE_CLONES_USED,
  [FEATURES.ACCOUNT_ANALYSIS]: USAGE_FIELDS.ACCOUNT_ANALYSIS_USED,
  [FEATURES.ACCOUNT_INSIGHTS]: USAGE_FIELDS.ACCOUNT_INSIGHTS_USED,
  [FEATURES.ACCOUNT_CHAT]: USAGE_FIELDS.ACCOUNT_CHAT_USED,
  [FEATURES.SCRIPT_CONVERSATIONS]: USAGE_FIELDS.SCRIPT_CONVERSATIONS_USED,
  [FEATURES.SCRIPT_GENERATION]: USAGE_FIELDS.SCRIPT_CONVERSATIONS_USED,
  [FEATURES.CHAT_AI]: USAGE_FIELDS.SCRIPT_CONVERSATIONS_USED,
} as const;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Usage information for a specific feature/action
 */
export interface UsageInfo {
  used: number;
  total: number;
  remaining: number;
  percentage: number;
}

/**
 * Feature access result
 */
export interface FeatureAccessResult {
  hasAccess: boolean;
  requiredPlan: PlanIdentifier | null;
  remainingUsage: number;
  totalLimit: number;
  currentPlan: PlanIdentifier;
  error?: string;
}

/**
 * Usage validation result
 */
export interface UsageValidationResult {
  isValid: boolean;
  remainingUsage: number;
  totalLimit: number;
  error?: string;
}

/**
 * Comprehensive monetization check result
 */
export interface MonetizationCheckResult {
  success: boolean;
  hasAccess: boolean;
  currentPlan: PlanIdentifier;
  remainingUsage: number;
  totalLimit: number;
  error?: string;
  details?: {
    featureId: FeatureId;
    requiredPlan: PlanIdentifier | null;
    usageType: UsageField;
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the action corresponding to a feature
 */
export function getActionForFeature(featureId: FeatureId): Action {
  return FEATURE_TO_ACTION_MAP[featureId];
}

/**
 * Get the usage field corresponding to an action
 */
export function getUsageFieldForAction(action: Action): UsageField {
  return ACTION_TO_USAGE_FIELD_MAP[action];
}

/**
 * Get the usage field corresponding to a feature
 */
export function getUsageFieldForFeature(featureId: FeatureId): UsageField {
  return FEATURE_TO_USAGE_FIELD_MAP[featureId];
}

/**
 * Check if a string is a valid feature ID
 */
export function isValidFeatureId(value: string): value is FeatureId {
  return Object.values(FEATURES).includes(value as FeatureId);
}

/**
 * Check if a string is a valid action
 */
export function isValidAction(value: string): value is Action {
  return Object.values(ACTIONS).includes(value as Action);
}

/**
 * Check if a string is a valid usage field
 */
export function isValidUsageField(value: string): value is UsageField {
  return Object.values(USAGE_FIELDS).includes(value as UsageField);
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Re-export plan types from database.ts
export type { PlanIdentifier } from './database'; 