/**
 * Subscription types for Editia Core
 * To be implemented in Phase 2
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  videos_generated_limit: number;
  source_videos_limit: number;
  voice_clones_limit: number;
  account_analysis_limit: number;
  is_unlimited: boolean;
  created_at?: string;
  updated_at?: string;
}

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete';

export interface SubscriptionResult {
  success: boolean;
  plan: SubscriptionPlan | null;
  status: SubscriptionStatus;
  error?: string;
} 