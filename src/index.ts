/**
 * Editia Core - Main Entry Point
 * 
 * This package provides unified authentication, monetization, and database management
 * for all Editia applications (mobile, server-primary, server-analyzer).
 * 
 * @package @editia/core
 * @version 1.0.0
 */

// ============================================================================
// TYPES EXPORTS
// ============================================================================

export * from './types';

// ============================================================================
// AUTHENTICATION EXPORTS
// ============================================================================

// Services
export { ClerkAuthService } from './services/auth/clerk-auth';

// Middleware
export {
  authenticateUser,
  requireProAccess,
  optionalAuth,
  createAuthMiddleware,
} from './middleware/auth/authenticate';

// ============================================================================
// UTILITIES EXPORTS
// ============================================================================

import { ClerkAuthService } from './services/auth/clerk-auth';
import type { AuthConfig } from './types/auth';

// ============================================================================
// CONFIGURATION EXPORTS
// ============================================================================

export type { AuthConfig } from './types/auth';

// ============================================================================
// INITIALIZATION FUNCTION
// ============================================================================

/**
 * Initialize Editia Core with configuration
 * This function must be called before using any authentication services
 * 
 * @param config Configuration object containing Clerk and Supabase credentials
 * @example
 * ```typescript
 * import { initializeEditiaCore } from '@editia/core';
 * 
 * initializeEditiaCore({
 *   clerkSecretKey: process.env.CLERK_SECRET_KEY!,
 *   supabaseUrl: process.env.SUPABASE_URL!,
 *   supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
 *   environment: 'production'
 * });
 * ```
 */
export function initializeEditiaCore(config: AuthConfig): void {
  try {
    // Validate required configuration
    if (!config.clerkSecretKey) {
      throw new Error('CLERK_SECRET_KEY is required');
    }
    if (!config.supabaseUrl) {
      throw new Error('SUPABASE_URL is required');
    }
    if (!config.supabaseServiceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
    }

    // Initialize authentication service
    ClerkAuthService.initialize(config);
    
    console.log('Editia Core initialized successfully', {
      environment: config.environment || 'development',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to initialize Editia Core:', errorMessage);
    throw new Error(`Editia Core initialization failed: ${errorMessage}`);
  }
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Convenience function to get database user ID from auth header
 * @param authHeader Authorization header containing Clerk JWT
 * @returns Database user ID or null
 */
export async function getUserId(authHeader?: string | null): Promise<string | null> {
  return ClerkAuthService.getDatabaseUserId(authHeader);
}

/**
 * Convenience function to verify user authentication
 * @param authHeader Authorization header containing Clerk JWT
 * @returns Authentication result
 */
export async function verifyUser(authHeader?: string | null) {
  return ClerkAuthService.verifyUser(authHeader);
}

/**
 * Convenience function to check Pro access
 * @param authHeader Authorization header containing Clerk JWT
 * @returns True if user has Pro access
 */
export async function hasProAccess(authHeader?: string | null): Promise<boolean> {
  return ClerkAuthService.hasProAccess(authHeader);
}

// ============================================================================
// VERSION INFO
// ============================================================================

export const VERSION = '1.0.0';
export const PACKAGE_NAME = '@editia/core';

// ============================================================================
// TYPE RE-EXPORTS FOR CONVENIENCE
// ============================================================================

// Re-export commonly used types for convenience
export type {
  DatabaseUser,
  AuthResult,
  AuthErrorResponse,
  AuthenticatedRequest,
} from './types/auth';

// ============================================================================
// DEPRECATION WARNINGS
// ============================================================================

/**
 * @deprecated Use initializeEditiaCore instead
 */
export function initialize(config: AuthConfig): void {
  console.warn(
    'DEPRECATED: Use initializeEditiaCore instead of initialize. This function will be removed in v2.0.0'
  );
  initializeEditiaCore(config);
} 