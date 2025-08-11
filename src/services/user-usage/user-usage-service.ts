/**
 * UserUsageService - Centralized user usage and subscription management
 * 
 * This service handles all user_usage table operations including:
 * - Creating and updating user usage records
 * - Syncing user limits with subscription plans
 * - Tracking usage increments
 * - Managing plan transitions
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  Database,
  PlanIdentifier,
  UserUsage,
  SubscriptionPlan,
  UsageField,
} from '../../types';

export interface UserUsageServiceConfig {
  supabaseClient: SupabaseClient<Database>;
}

export class UserUsageService {
  private static instance: UserUsageService;
  private supabaseClient: SupabaseClient<Database>;

  private constructor(config: UserUsageServiceConfig) {
    this.supabaseClient = config.supabaseClient;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(supabaseClient?: SupabaseClient<Database>): UserUsageService {
    if (!UserUsageService.instance && supabaseClient) {
      UserUsageService.instance = new UserUsageService({ supabaseClient });
    }
    if (!UserUsageService.instance) {
      throw new Error('UserUsageService must be initialized with supabaseClient first');
    }
    return UserUsageService.instance;
  }

  /**
   * Create a new user usage record
   */
  async createUserUsage(userId: string, planId: PlanIdentifier = 'free'): Promise<UserUsage | null> {
    try {
      // Get plan limits
      const planData = await this.getPlanLimits(planId);
      if (!planData) {
        console.error('Failed to fetch plan limits for:', planId);
        return null;
      }

      const { data, error } = await this.supabaseClient
        .from('user_usage')
        .insert([{
          user_id: userId,
          current_plan_id: planId,
          videos_generated: 0,
          videos_generated_limit: planData.videos_generated_limit,
          source_videos_used: 0,
          source_videos_limit: planData.source_videos_limit,
          voice_clones_used: 0,
          voice_clones_limit: planData.voice_clones_limit,
          account_analysis_used: 0,
          account_analysis_limit: planData.account_analysis_limit,
          script_conversations_used: 0,
          script_conversations_limit: planData.script_conversations_limit,
          subscription_status: 'active',
          next_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Failed to create user usage record:', error);
        return null;
      }

      return data as UserUsage;
    } catch (error) {
      console.error('Error creating user usage:', error);
      return null;
    }
  }

  /**
   * Get user usage record
   */
  async getUserUsage(userId: string): Promise<UserUsage | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found, create one
          console.log('No usage record found, creating one...');
          return await this.createUserUsage(userId);
        }
        console.error('Error fetching user usage:', error);
        return null;
      }

      return data as UserUsage;
    } catch (error) {
      console.error('Error getting user usage:', error);
      return null;
    }
  }

  /**
   * Update user's plan and sync limits
   */
  async updateUserPlan(userId: string, planId: PlanIdentifier): Promise<UserUsage | null> {
    try {
      console.log(`🔄 Updating user ${userId} to plan ${planId}`);
      
      // Check if user_usage record exists
      const existingUsage = await this.getUserUsage(userId);
      
      if (!existingUsage) {
        console.log('Creating new usage record for user');
        return await this.createUserUsage(userId, planId);
      }

      // Get plan limits
      const planData = await this.getPlanLimits(planId);
      if (!planData) {
        console.error('Failed to fetch plan limits for:', planId);
        return null;
      }

      // Update user usage with new plan limits
      const { data, error } = await this.supabaseClient
        .from('user_usage')
        .update({
          current_plan_id: planId,
          videos_generated_limit: planData.videos_generated_limit,
          source_videos_limit: planData.source_videos_limit,
          voice_clones_limit: planData.voice_clones_limit,
          account_analysis_limit: planData.account_analysis_limit,
          script_conversations_limit: planData.script_conversations_limit,
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Failed to update user plan:', error);
        return null;
      }

      console.log(`✅ Successfully updated user ${userId} to plan ${planId}`);
      return data as UserUsage;
    } catch (error) {
      console.error('Error updating user plan:', error);
      return null;
    }
  }

  /**
   * Sync user limits with their current plan (alias for updateUserPlan)
   */
  async syncUserLimitsWithPlan(userId: string, planId: PlanIdentifier): Promise<UserUsage | null> {
    return this.updateUserPlan(userId, planId);
  }

  /**
   * Increment usage for a specific field
   */
  async incrementUsage(userId: string, field: UsageField, amount: number = 1): Promise<boolean> {
    try {
      // Get current usage
      const usage = await this.getUserUsage(userId);
      if (!usage) {
        console.error('No usage record found for user:', userId);
        return false;
      }

      // Map field to database column
      const fieldMap: Record<UsageField, string> = {
        'videos_generated': 'videos_generated',
        'source_videos_used': 'source_videos_used',
        'voice_clones_used': 'voice_clones_used',
        'account_analysis_used': 'account_analysis_used',
        'script_conversations_used': 'script_conversations_used',
        'account_insights_used': 'account_analysis_used', // Map to same field
        'account_chat_used': 'account_analysis_used', // Map to same field
      };

      const dbField = fieldMap[field];
      if (!dbField) {
        console.error('Invalid usage field:', field);
        return false;
      }

      // Calculate new value
      const currentValue = (usage as any)[dbField] || 0;
      const newValue = currentValue + amount;

      // Update the specific field
      const { error } = await this.supabaseClient
        .from('user_usage')
        .update({
          [dbField]: newValue,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to increment usage:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  }

  /**
   * Reset monthly usage counters
   */
  async resetMonthlyUsage(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient
        .from('user_usage')
        .update({
          videos_generated: 0,
          source_videos_used: 0,
          voice_clones_used: 0,
          account_analysis_used: 0,
          script_conversations_used: 0,
          last_reset_date: new Date().toISOString(),
          next_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to reset monthly usage:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
      return false;
    }
  }

  /**
   * Get plan limits from database
   */
  async getPlanLimits(planId: PlanIdentifier): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) {
        console.error('Error fetching plan limits:', error);
        return null;
      }

      return data as SubscriptionPlan;
    } catch (error) {
      console.error('Error getting plan limits:', error);
      return null;
    }
  }

  /**
   * Check if user has reached limit for a specific field
   */
  async checkUsageLimit(userId: string, field: UsageField): Promise<boolean> {
    try {
      const usage = await this.getUserUsage(userId);
      if (!usage) return true; // Assume limit reached if no record

      const fieldMap: Record<UsageField, { used: string; limit: string }> = {
        'videos_generated': { used: 'videos_generated', limit: 'videos_generated_limit' },
        'source_videos_used': { used: 'source_videos_used', limit: 'source_videos_limit' },
        'voice_clones_used': { used: 'voice_clones_used', limit: 'voice_clones_limit' },
        'account_analysis_used': { used: 'account_analysis_used', limit: 'account_analysis_limit' },
        'script_conversations_used': { used: 'script_conversations_used', limit: 'script_conversations_limit' },
        'account_insights_used': { used: 'account_analysis_used', limit: 'account_analysis_limit' },
        'account_chat_used': { used: 'account_analysis_used', limit: 'account_analysis_limit' },
      };

      const mapping = fieldMap[field];
      if (!mapping) {
        console.error('Invalid usage field:', field);
        return true;
      }

      const used = (usage as any)[mapping.used] || 0;
      const limit = (usage as any)[mapping.limit] || 0;

      // -1 means unlimited
      if (limit === -1) return false;

      return used >= limit;
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return true; // Assume limit reached on error
    }
  }

  /**
   * Clear the singleton instance (useful for testing)
   */
  public static clearInstance(): void {
    UserUsageService.instance = null as any;
  }
}

export default UserUsageService;