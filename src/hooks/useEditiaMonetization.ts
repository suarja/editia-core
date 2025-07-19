/**
 * Editia Monetization Hook for React Native
 * 
 * This hook provides a unified interface for monetization features including:
 * - Subscription plan management
 * - Usage tracking
 * - Feature access control
 * - Paywall presentation
 */

import { useState, useEffect, useCallback } from 'react';

import {
  PlanIdentifier,
  UserUsage,
  SubscriptionPlan,
  calculateRemainingUsage,
  hasPlanAccess,
  FEATURE_FLAGS,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface EditiaMonetizationConfig {
  supabaseClient: any; // Supabase client instance
  environment?: 'development' | 'production';
  userId?: string;
}

export interface EditiaMonetizationState {
  isLoading: boolean;
  currentPlan: PlanIdentifier;
  userUsage: UserUsage | null;
  plans: Record<string, SubscriptionPlan> | null;
  showPaywall: boolean;
  isPurchasing: boolean;
  hasOfferingError: boolean;
  isReady: boolean;
}

export interface EditiaMonetizationActions {
  presentPaywall: () => Promise<boolean>;
  setShowPaywall: (show: boolean) => void;
  refreshUsage: () => Promise<void>;
  checkFeatureAccess: (featureId: string) => boolean;
  getFeatureAccessInfo: (featureId: string) => {
    hasAccess: boolean;
    requiredPlan: PlanIdentifier | null;
    remainingUsage: number;
    totalLimit: number;
  };
}

export type UseEditiaMonetizationReturn = EditiaMonetizationState & EditiaMonetizationActions & {
  videosRemaining: number;
  sourceVideosRemaining: number;
  voiceClonesRemaining: number;
  accountAnalysisRemaining: number;
};

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const useEditiaMonetization = (
  config: EditiaMonetizationConfig
): UseEditiaMonetizationReturn => {
  const [state, setState] = useState<EditiaMonetizationState>({
    isLoading: true,
    currentPlan: 'free',
    userUsage: null,
    plans: null,
    showPaywall: false,
    isPurchasing: false,
    hasOfferingError: false,
    isReady: false,
  });

  const { supabaseClient, environment = 'development', userId } = config;

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    initializeHook();
  }, [userId]);

  const initializeHook = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Load subscription plans
      await loadSubscriptionPlans();

      // Load user usage if userId is provided
      if (userId) {
        await loadUserUsage();
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isReady: true 
      }));
    } catch (error) {
      console.error('Error initializing Editia monetization:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isReady: true,
        hasOfferingError: true 
      }));
    }
  };

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Failed to fetch subscription plans:', error);
        return;
      }

      const plansData = data.reduce((acc: any, plan: any) => {
        acc[plan.id] = plan;
        return acc;
      }, {});

      setState(prev => ({
        ...prev,
        plans: plansData,
      }));
    } catch (error) {
      console.error('Error loading subscription plans:', error);
    }
  };

  const loadUserUsage = async () => {
    if (!userId) return;

    try {
      const { data: usage, error } = await supabaseClient
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No usage record found, create one
          await createUsageRecord(userId);
          return;
        }
        console.error('Failed to load user usage:', error);
        return;
      }

      setState(prev => ({
        ...prev,
        userUsage: usage,
        currentPlan: usage.current_plan_id as PlanIdentifier,
      }));
    } catch (error) {
      console.error('Error loading user usage:', error);
    }
  };

  const createUsageRecord = async (userId: string) => {
    try {
      const { data: planData, error: planError } = await supabaseClient
        .from('subscription_plans')
        .select('*')
        .eq('id', 'free')
        .single();

      if (planError) {
        console.error('Failed to fetch plan limits:', planError);
        return;
      }

      const { data, error } = await supabaseClient
        .from('user_usage')
        .insert([
          {
            user_id: userId,
            current_plan_id: 'free',
            videos_generated: 0,
            videos_generated_limit: planData.videos_generated_limit,
            source_videos_used: 0,
            source_videos_limit: planData.source_videos_limit,
            voice_clones_used: 0,
            voice_clones_limit: planData.voice_clones_limit,
            account_analysis_used: 0,
            account_analysis_limit: planData.account_analysis_limit,
            next_reset_date: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Failed to create usage record:', error);
        return;
      }

      setState(prev => ({
        ...prev,
        userUsage: data,
        currentPlan: 'free',
      }));
    } catch (error) {
      console.error('Error creating usage record:', error);
    }
  };

  // ============================================================================
  // FEATURE ACCESS CONTROL
  // ============================================================================

  const checkFeatureAccess = useCallback((featureId: string): boolean => {
    if (!state.userUsage) return false;

    // Check if feature exists in FEATURE_FLAGS
    const featureKey = Object.keys(FEATURE_FLAGS).find(
      key => FEATURE_FLAGS[key as keyof typeof FEATURE_FLAGS] === featureId
    );

    if (!featureKey) {
      console.warn(`Feature flag ${featureId} not found`);
      return false;
    }

    // For now, use hardcoded logic based on feature ID
    // In a real implementation, this would query the feature_flags table
    const featureRequirements: Record<string, PlanIdentifier> = {
      'account_analysis': 'free',
      'chat_ai': 'free',
      'script_generation': 'creator',
      'video_generation': 'creator',
      'source_videos': 'creator',
      'advanced_subtitles': 'creator',
      'voice_clone': 'pro',
      'multiple_voices': 'pro',
      'niche_analysis': 'pro',
      'content_ideas': 'pro',
      'scheduling': 'pro',
    };

    const requiredPlan = featureRequirements[featureId];
    if (!requiredPlan) return true; // No restriction

    return hasPlanAccess(state.currentPlan, requiredPlan);
  }, [state.currentPlan, state.userUsage]);

  const getFeatureAccessInfo = useCallback((featureId: string) => {
    const hasAccess = checkFeatureAccess(featureId);
    
    // For now, return basic info
    // In a real implementation, this would query the feature_flags table
    const featureRequirements: Record<string, PlanIdentifier> = {
      'account_analysis': 'free',
      'chat_ai': 'free',
      'script_generation': 'creator',
      'video_generation': 'creator',
      'source_videos': 'creator',
      'advanced_subtitles': 'creator',
      'voice_clone': 'pro',
      'multiple_voices': 'pro',
      'niche_analysis': 'pro',
      'content_ideas': 'pro',
      'scheduling': 'pro',
    };

    const requiredPlan = featureRequirements[featureId] || null;
    const remainingUsage = state.userUsage ? 
      calculateRemainingUsage(state.userUsage.videos_generated, state.userUsage.videos_generated_limit) : 0;
    const totalLimit = state.userUsage?.videos_generated_limit || 0;

    return {
      hasAccess,
      requiredPlan,
      remainingUsage,
      totalLimit,
    };
  }, [state.userUsage, checkFeatureAccess]);

  // ============================================================================
  // PAYWALL MANAGEMENT
  // ============================================================================

  const presentPaywall = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isPurchasing: true }));

      // In development mode, simulate Pro access for testing
      if (environment === 'development') {
        console.log('🔧 Development mode: simulating Pro access');
        // Simulate successful purchase
        await new Promise(resolve => setTimeout(resolve, 1000));
        setState(prev => ({ 
          ...prev, 
          currentPlan: 'pro',
          isPurchasing: false 
        }));
        return true;
      }

      // Show paywall
      setState(prev => ({ ...prev, showPaywall: true, isPurchasing: false }));
      return false;
    } catch (error) {
      console.error('Paywall error:', error);
      setState(prev => ({ 
        ...prev, 
        isPurchasing: false,
        hasOfferingError: true 
      }));
      return false;
    }
  }, [environment]);

  const setShowPaywall = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showPaywall: show }));
  }, []);

  const refreshUsage = useCallback(async () => {
    await loadUserUsage();
  }, [userId]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const videosRemaining = state.userUsage
    ? calculateRemainingUsage(
        state.userUsage.videos_generated,
        state.userUsage.videos_generated_limit
      )
    : 0;

  const sourceVideosRemaining = state.userUsage
    ? calculateRemainingUsage(
        state.userUsage.source_videos_used,
        state.userUsage.source_videos_limit
      )
    : 0;

  const voiceClonesRemaining = state.userUsage
    ? calculateRemainingUsage(
        state.userUsage.voice_clones_used,
        state.userUsage.voice_clones_limit
      )
    : 0;

  const accountAnalysisRemaining = state.userUsage
    ? calculateRemainingUsage(
        state.userUsage.account_analysis_used,
        state.userUsage.account_analysis_limit
      )
    : 0;

  return {
    // State
    ...state,
    
    // Actions
    presentPaywall,
    setShowPaywall,
    refreshUsage,
    checkFeatureAccess,
    getFeatureAccessInfo,
    
    // Computed values
    videosRemaining,
    sourceVideosRemaining,
    voiceClonesRemaining,
    accountAnalysisRemaining,
  };
}; 