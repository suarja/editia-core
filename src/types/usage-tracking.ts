/**
 * Usage tracking types for Editia Core
 * To be implemented in Phase 2
 */

export interface UserUsage {
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
  next_reset_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface UsageLimit {
  resourceType: string;
  currentUsage: number;
  limit: number;
  remaining: number;
  resetDate?: string;
}

export interface UsageTrackingResult {
  success: boolean;
  usage: UserUsage | null;
  error?: string;
} 
