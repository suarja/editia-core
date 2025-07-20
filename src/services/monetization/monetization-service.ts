/**
 * Editia Monetization Service - Backend
 * 
 * This service centralizes all monetization logic for backend operations.
 * It provides methods to check feature access, validate usage limits,
 * and manage subscription-based restrictions.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  Database,
  PlanIdentifier,
  UserUsage,
  SubscriptionPlan,
  FeatureFlag,
  hasPlanAccess,
  calculateRemainingUsage,
  hasReachedLimit,
  FEATURE_FLAGS,
  DEFAULT_PLAN_LIMITS,
} from '../../types';

// ============================================================================
// TYPES
// ============================================================================

export interface MonetizationConfig {
  supabaseClient: SupabaseClient<Database>;
  environment?: 'development' | 'production' | 'test';
}

export interface FeatureAccessResult {
  hasAccess: boolean;
  requiredPlan: PlanIdentifier | null;
  remainingUsage: number;
  totalLimit: number;
  currentPlan: PlanIdentifier;
  error?: string;
}

export interface UsageValidationResult {
  isValid: boolean;
  remainingUsage: number;
  totalLimit: number;
  error?: string;
}

export interface MonetizationCheckResult {
  success: boolean;
  hasAccess: boolean;
  currentPlan: PlanIdentifier;
  remainingUsage: number;
  totalLimit: number;
  error?: string;
  details?: {
    featureId: string;
    requiredPlan: PlanIdentifier | null;
    usageType: 'videos' | 'source_videos' | 'voice_clones' | 'account_analysis';
  };
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export class MonetizationService {
  private static instance: MonetizationService;
  private supabaseClient: SupabaseClient<Database>;
  private environment: 'development' | 'production' | 'test';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private constructor(config: MonetizationConfig) {
    this.supabaseClient = config.supabaseClient;
    this.environment = config.environment || 'development';
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: MonetizationConfig): MonetizationService {
    if (!MonetizationService.instance && config) {
      MonetizationService.instance = new MonetizationService(config);
    }
    if (!MonetizationService.instance) {
      throw new Error('MonetizationService must be initialized with config first');
    }
    return MonetizationService.instance;
  }

  /**
   * Initialize the service (call once at startup)
   */
  public static initialize(config: MonetizationConfig): void {
    if (!MonetizationService.instance) {
      MonetizationService.instance = new MonetizationService(config);
    }
  }

  // ============================================================================
  // CORE MONETIZATION CHECKS
  // ============================================================================

  /**
   * Check if user has access to a specific feature
   */
  public async checkFeatureAccess(
    userId: string,
    featureId: string
  ): Promise<FeatureAccessResult> {
    try {
      // Get user usage data
      const userUsage = await this.getUserUsage(userId);
      if (!userUsage) {
        return {
          hasAccess: false,
          requiredPlan: null,
          remainingUsage: 0,
          totalLimit: 0,
          currentPlan: 'free',
          error: 'User usage not found',
        };
      }

      // Get feature requirements
      const featureRequirements = await this.getFeatureRequirements(featureId);
      const requiredPlan = featureRequirements?.required_plan as PlanIdentifier;

      // Check plan access
      const hasAccess = !requiredPlan || hasPlanAccess(userUsage.current_plan_id, requiredPlan);

      // Get usage info for the feature
      const usageInfo = this.getUsageInfoForFeature(featureId, userUsage);

      return {
        hasAccess,
        requiredPlan,
        remainingUsage: calculateRemainingUsage(usageInfo.used, usageInfo.total),
        totalLimit: usageInfo.total,
        currentPlan: userUsage.current_plan_id,
      };
    } catch (error) {
      console.error('Error checking feature access:', error);
      return {
        hasAccess: false,
        requiredPlan: null,
        remainingUsage: 0,
        totalLimit: 0,
        currentPlan: 'free',
        error: 'Service error',
      };
    }
  }

  /**
   * Validate if user can perform an action (e.g., generate video, upload file)
   */
  public async validateUsage(
    userId: string,
    action: 'video_generation' | 'source_video_upload' | 'voice_clone' | 'account_analysis'
  ): Promise<UsageValidationResult> {
    try {
      const userUsage = await this.getUserUsage(userId);
      if (!userUsage) {
        return {
          isValid: false,
          remainingUsage: 0,
          totalLimit: 0,
          error: 'User usage not found',
        };
      }

      const usageInfo = this.getUsageInfoForAction(action, userUsage);
      const isValid = !hasReachedLimit(usageInfo.used, usageInfo.total);

      return {
        isValid,
        remainingUsage: calculateRemainingUsage(usageInfo.used, usageInfo.total),
        totalLimit: usageInfo.total,
        error: isValid ? undefined : 'Usage limit reached',
      };
    } catch (error) {
      console.error('Error validating usage:', error);
      return {
        isValid: false,
        remainingUsage: 0,
        totalLimit: 0,
        error: 'Service error',
      };
    }
  }

  /**
   * Comprehensive check for feature access and usage validation
   */
  public async checkMonetization(
    userId: string,
    featureId: string
  ): Promise<MonetizationCheckResult> {
    try {
      // Check feature access
      const accessResult = await this.checkFeatureAccess(userId, featureId);
      
      if (!accessResult.hasAccess) {
        return {
          success: false,
          hasAccess: false,
          currentPlan: accessResult.currentPlan,
          remainingUsage: 0,
          totalLimit: 0,
          error: `Feature requires ${accessResult.requiredPlan} plan`,
          details: {
            featureId,
            requiredPlan: accessResult.requiredPlan,
            usageType: this.getUsageTypeForFeature(featureId),
          },
        };
      }

      // Check usage limits
      const action = this.getActionForFeature(featureId);
      const usageResult = await this.validateUsage(userId, action);

      if (!usageResult.isValid) {
        return {
          success: false,
          hasAccess: true,
          currentPlan: accessResult.currentPlan,
          remainingUsage: usageResult.remainingUsage,
          totalLimit: usageResult.totalLimit,
          error: 'Usage limit reached',
          details: {
            featureId,
            requiredPlan: accessResult.requiredPlan,
            usageType: this.getUsageTypeForFeature(featureId),
          },
        };
      }

      return {
        success: true,
        hasAccess: true,
        currentPlan: accessResult.currentPlan,
        remainingUsage: usageResult.remainingUsage,
        totalLimit: usageResult.totalLimit,
        details: {
          featureId,
          requiredPlan: accessResult.requiredPlan,
          usageType: this.getUsageTypeForFeature(featureId),
        },
      };
    } catch (error) {
      console.error('Error in monetization check:', error);
      return {
        success: false,
        hasAccess: false,
        currentPlan: 'free',
        remainingUsage: 0,
        totalLimit: 0,
        error: 'Service error',
      };
    }
  }

  // ============================================================================
  // USAGE MANAGEMENT
  // ============================================================================

  /**
   * Increment usage for a specific action
   */
  public async incrementUsage(
    userId: string,
    action: 'video_generation' | 'source_video_upload' | 'voice_clone' | 'account_analysis'
  ): Promise<boolean> {
    try {
      const fieldMap = {
        video_generation: 'videos_generated',
        source_video_upload: 'source_videos_used',
        voice_clone: 'voice_clones_used',
        account_analysis: 'account_analysis_used',
      };

      const field = fieldMap[action];
      const { error } = await this.supabaseClient.rpc('increment_user_usage', { 
          p_user_id: userId, 
          p_field_to_increment: field 
        }) 
       

      if (error) {
        console.error('Error incrementing usage:', error);
        return false;
      }

      // Clear cache for this user
      this.clearUserCache(userId);
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  }

  /**
   * Decrement usage for a specific action
   */
  public async decrementUsage(
    userId: string,
    action: 'video_generation' | 'source_video_upload' | 'voice_clone' | 'account_analysis'
  ): Promise<boolean> {
    try {
      const fieldMap = {
        video_generation: 'videos_generated',
        source_video_upload: 'source_videos_used',
        voice_clone: 'voice_clones_used',
        account_analysis: 'account_analysis_used',
      };

      const field = fieldMap[action];
      const { error } = await this.supabaseClient.rpc('decrement_user_usage', { 
        p_user_id: userId, 
        p_field_to_decrement: field 
      });

      if (error) {
        console.error('Error decrementing usage:', error);
        return false;
      }

      // Clear cache for this user
      this.clearUserCache(userId);  
      return true;
    } catch (error) {
      console.error('Error decrementing usage:', error);
      return false;
    }
  }
  /**
   * Get current usage for a user
   */
  public async getUserUsage(userId: string): Promise<UserUsage | null> {
    const cacheKey = `usage_${userId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const { data, error } = await this.supabaseClient
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user usage:', error);
        return null;
      }

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data as UserUsage;
    } catch (error) {
      console.error('Error fetching user usage:', error);
      return null;
    }
  }

  // ============================================================================
  // FEATURE MANAGEMENT
  // ============================================================================

  /**
   * Get feature requirements from database
   */
  private async getFeatureRequirements(featureId: string): Promise<FeatureFlag | null> {
    const cacheKey = `feature_${featureId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const { data, error } = await this.supabaseClient
        .from('feature_flags')
        .select('*')
        .eq('id', featureId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching feature requirements:', error);
        return null;
      }

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data as FeatureFlag;
    } catch (error) {
      console.error('Error fetching feature requirements:', error);
      return null;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get usage information for a specific feature
   */
  private getUsageInfoForFeature(featureId: string, userUsage: UserUsage) {
    const usageMap: Record<string, { used: number; total: number }> = {
      'video_generation': {
        used: userUsage.videos_generated,
        total: userUsage.videos_generated_limit,
      },
      'source_videos': {
        used: userUsage.source_videos_used,
        total: userUsage.source_videos_limit,
      },
      'voice_clone': {
        used: userUsage.voice_clones_used,
        total: userUsage.voice_clones_limit,
      },
      'account_analysis': {
        used: userUsage.account_analysis_used,
        total: userUsage.account_analysis_limit,
      },
    };

    return usageMap[featureId] || { used: 0, total: 0 };
  }

  /**
   * Get usage information for a specific action
   */
  private getUsageInfoForAction(action: string, userUsage: UserUsage) {
    const actionMap: Record<string, { used: number; total: number }> = {
      video_generation: {
        used: userUsage.videos_generated,
        total: userUsage.videos_generated_limit,
      },
      source_video_upload: {
        used: userUsage.source_videos_used,
        total: userUsage.source_videos_limit,
      },
      voice_clone: {
        used: userUsage.voice_clones_used,
        total: userUsage.voice_clones_limit,
      },
      account_analysis: {
        used: userUsage.account_analysis_used,
        total: userUsage.account_analysis_limit,
      },
    };

    return actionMap[action] || { used: 0, total: 0 };
  }

  /**
   * Map feature ID to action type
   */
  private getActionForFeature(featureId: string): 'video_generation' | 'source_video_upload' | 'voice_clone' | 'account_analysis' {
    const featureActionMap: Record<string, any> = {
      'video_generation': 'video_generation',
      'source_videos': 'source_video_upload',
      'voice_clone': 'voice_clone',
      'account_analysis': 'account_analysis',
    };

    return featureActionMap[featureId] || 'video_generation';
  }

  /**
   * Map feature ID to usage type
   */
  private getUsageTypeForFeature(featureId: string): 'videos' | 'source_videos' | 'voice_clones' | 'account_analysis' {
    const featureUsageMap: Record<string, any> = {
      'video_generation': 'videos',
      'source_videos': 'source_videos',
      'voice_clone': 'voice_clones',
      'account_analysis': 'account_analysis',
    };

    return featureUsageMap[featureId] || 'videos';
  }

  /**
   * Clear cache for a specific user
   */
  private clearUserCache(userId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(userId));
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  // ============================================================================
  // DEVELOPMENT HELPERS
  // ============================================================================

  /**
   * Get debug information for a user (development only)
   */
  public async getDebugInfo(userId: string): Promise<any> {
    if (this.environment !== 'development') {
      throw new Error('Debug info only available in development');
    }

    const userUsage = await this.getUserUsage(userId);
    const featureChecks = await Promise.all(
      Object.values(FEATURE_FLAGS).map(async (featureId) => ({
        featureId,
        access: await this.checkFeatureAccess(userId, featureId),
      }))
    );

    return {
      userUsage,
      featureChecks,
      environment: this.environment,
      cacheSize: this.cache.size,
    };
  }
} 