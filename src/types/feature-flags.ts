/**
 * Feature flags types for Editia Core
 * To be implemented in Phase 2
 */

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  required_plan: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FeatureAccessResult {
  hasAccess: boolean;
  isLoading: boolean;
  remainingUsage?: number;
  totalLimit?: number;
  currentPlan: string;
  error?: string;
}

export interface FeatureAccessConfig {
  featureId: string;
  userId: string;
  currentPlan: string;
} 