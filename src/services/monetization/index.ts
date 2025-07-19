/**
 * Monetization Services - Main Export
 * 
 * This file exports all monetization-related services and utilities
 * for backend operations.
 */

// ============================================================================
// CORE SERVICE
// ============================================================================

export {
  MonetizationService,
  MonetizationConfig,
  FeatureAccessResult,
  UsageValidationResult,
  MonetizationCheckResult,
} from './monetization-service';

// ============================================================================
// MIDDLEWARE
// ============================================================================

export {
  createMonetizationMiddleware,
  createUsageIncrementMiddleware,
  addMonetizationHeaders,
  logMonetizationChecks,
  MonetizationMiddlewareConfig,
  MonetizationRequest,
} from '../../middleware/monetization-middleware';

// ============================================================================
// PRESET MIDDLEWARE
// ============================================================================

export {
  videoGenerationMiddleware,
  sourceVideoUploadMiddleware,
  voiceCloneMiddleware,
  accountAnalysisMiddleware,
  scriptGenerationMiddleware,
  chatAiMiddleware,
} from '../../middleware/monetization-middleware';

// ============================================================================
// ERROR HANDLERS
// ============================================================================

export {
  defaultMonetizationErrorHandler,
  userFriendlyMonetizationErrorHandler,
} from '../../middleware/monetization-middleware'; 