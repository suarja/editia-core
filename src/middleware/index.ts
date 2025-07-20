/**
 * Middleware - Main Export
 * 
 * This file exports all middleware-related middleware.
 */

export {
  authenticateUser,
  requireProAccess,
  optionalAuth,
  createAuthMiddleware,
} from './auth';

export {
  createMonetizationMiddleware,
  createUsageIncrementMiddleware,
  addMonetizationHeaders,
  logMonetizationChecks,
  defaultMonetizationErrorHandler,
  userFriendlyMonetizationErrorHandler,
} from './monetization';