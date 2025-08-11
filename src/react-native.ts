/**
 * React Native compatible exports from editia-core
 * This file excludes any Node.js specific APIs like crypto, fs, etc.
 */

// ============================================================================
// TYPES ONLY EXPORTS (Safe for React Native)
// ============================================================================

// Video types and validation
export type * from './video/types';
export * from './video/constants';
export * from './video/validation';

// Core types
export type * from './types/auth';
export type * from './types/database';
export type * from './types/database.types';
export type * from './types/compatibility';

// Re-export specific types to avoid conflicts
export type { FeatureAccessResult } from './types/monetization';
export type { FeatureFlag } from './types/feature-flags';
export type { SubscriptionPlan } from './types/subscriptions';
export type { UserUsage, UsageField } from './types/usage-tracking';
export type { PlanIdentifier } from './types/monetization';

// Re-export only the validation functions and schemas (no services)
export {
  CaptionConfigurationSchema,
  VideoEditorialProfileSchema,
  VideoGenerationRequestSchema,
  validateVideoDuration,
  validateCaptionConfig,
  validateVideoEditorialProfile,
  validateVideoGenerationRequest,
  isValidHexColor,
  isValidVideo,
} from './video/validation';

export {
  VideoRequestStatus,
  LANGUAGES,
  CAPTION_PLACEMENTS,
  TRANSCRIPT_EFFECTS,
} from './video/constants';

// Template service without Node.js dependencies
export { VideoTemplateService } from './video/template-service';

// User usage service (compatible with React Native via @supabase/supabase-js)
export { UserUsageService, UserUsageServiceConfig } from './services/user-usage';

// ============================================================================
// EXCLUDED FROM REACT NATIVE
// ============================================================================
// The following are excluded because they use Node.js APIs:
// - Services that use @clerk/backend
// - Services that use Node.js crypto
// - Middleware that uses Node.js specific features
// - Any service that imports from @supabase/supabase-js directly