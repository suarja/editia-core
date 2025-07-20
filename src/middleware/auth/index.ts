/**
 * Authentication Middleware - Main Export
 * 
 * This file exports all authentication-related middleware.
 */

export {
  authenticateUser,
  requireProAccess,
  optionalAuth,
  createAuthMiddleware,
} from './authenticate';