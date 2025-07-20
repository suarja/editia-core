/**
 * Usage tracking types for Editia Core
 * 
 * This file re-exports usage tracking types from the centralized monetization types
 * and provides additional usage-specific interfaces.
 */

import type { UserUsage as DatabaseUserUsage } from './database';
import type { UsageInfo, UsageField } from './monetization';

// ============================================================================
// RE-EXPORTS
// ============================================================================

/**
 * Re-export UserUsage from database types to avoid duplication
 */
export type UserUsage = DatabaseUserUsage;

/**
 * Usage limit information for a specific resource
 */
export interface UsageLimit {
  resourceType: UsageField;
  currentUsage: number;
  limit: number;
  remaining: number;
  resetDate?: string;
}

/**
 * Usage tracking result
 */
export interface UsageTrackingResult {
  success: boolean;
  usage: UserUsage | null;
  error?: string;
}

/**
 * Detailed usage information for all features
 */
export interface DetailedUsageInfo {
  videoGeneration: UsageInfo;
  sourceVideos: UsageInfo;
  voiceClones: UsageInfo;
  accountAnalysis: UsageInfo;
  scriptConversations: UsageInfo;
  nextResetDate: string;
}

/**
 * Usage summary for dashboard display
 */
export interface UsageSummary {
  totalUsage: number;
  totalLimit: number;
  remainingUsage: number;
  usagePercentage: number;
  features: {
    [key in UsageField]: UsageInfo;
  };
} 
