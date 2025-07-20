/**
 * Editia Core Types - Main Export File
 * 
 * This file provides a centralized export point for all types used in Editia Core.
 * It organizes types by category and provides backward compatibility.
 */

// ============================================================================
// DATABASE TYPES
// ============================================================================

export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
  TableRow,
  TableInsert,
  TableUpdate,
  DatabaseEnum,
} from './database';

// ============================================================================
// MONETIZATION TYPES
// ============================================================================

export type {
  FeatureId,
  Action,
  UsageField,
  UsageInfo,
  FeatureAccessResult,
  UsageValidationResult,
  MonetizationCheckResult,
} from './monetization';

export {
  FEATURES,
  ACTIONS,
  USAGE_FIELDS,
  FEATURE_TO_ACTION_MAP,
  ACTION_TO_USAGE_FIELD_MAP,
  FEATURE_TO_USAGE_FIELD_MAP,
  getActionForFeature,
  getUsageFieldForAction,
  getUsageFieldForFeature,
  isValidFeatureId,
  isValidAction,
  isValidUsageField,
} from './monetization';

// ============================================================================
// USAGE TRACKING TYPES
// ============================================================================

export type {
  UserUsage,
  UsageLimit,
  UsageTrackingResult,
  DetailedUsageInfo,
  UsageSummary,
} from './usage-tracking';

// ============================================================================
// BUSINESS TYPES
// ============================================================================

export type {
  PlanIdentifier,
  User,
  SubscriptionPlan,
  FeatureFlag,
  EditorialProfile,
  VoiceClone,
  Video,
} from './database';

// ============================================================================
// CONSTANTS
// ============================================================================

export {
  DEFAULT_PLAN_LIMITS,
  PLAN_HIERARCHY,
  FEATURE_FLAGS,
  USAGE_RESET_PERIODS,
  USAGE_WARNING_THRESHOLDS,
  MAXIMUM_LIMITS,
  MINIMUM_LIMITS,
  CACHE_TIMEOUTS,
  MONETIZATION_ERROR_CODES,
} from './constants';

export type {
  FeatureFlagId,
  MonetizationErrorCode,
} from './constants';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export {
  isValidPlanIdentifier,
  getPlanLevel,
  hasPlanAccess,
  calculateRemainingUsage,
  hasReachedLimit,
  getUsagePercentage,
} from './database';

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

// Re-export legacy types and functions for backward compatibility
export {
  // Legacy types
  FeatureIdLegacy,
  ActionLegacy,
  UsageFieldLegacy,
  UserUsageLegacy,
  
  // Legacy constants
  LEGACY_FEATURES,
  LEGACY_ACTIONS,
  
  // Compatibility functions
  toFeatureId,
  toAction,
  toUsageField,
  toLegacyUserUsage,
  showDeprecationWarning,
} from './compatibility';

// ============================================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================================

// Re-export everything from database for backward compatibility
export * from './database';

// Re-export everything from monetization for backward compatibility
export * from './monetization';

// Re-export everything from usage-tracking for backward compatibility
export * from './usage-tracking';

// Re-export everything from constants for backward compatibility
export * from './constants';

// Re-export everything from compatibility for backward compatibility
export * from './compatibility'; 