/**
 * Express Authentication Middleware
 * Based on analysis of server-analyzer patterns
 */

import { Request, Response, NextFunction } from 'express';
import { ClerkAuthService } from '../../services/auth/clerk-auth';
import { DatabaseUser } from '../../types/auth';


// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: DatabaseUser;
    }
  }
}

/**
 * Authentication middleware for Express
 * Verifies Clerk JWT and ensures user exists in database
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    // Use ClerkAuthService to verify user
    const { user, errorResponse } = await ClerkAuthService.verifyUser(authHeader);

    if (errorResponse) {
      res.status(errorResponse.status).json(errorResponse);
      return;
    }

    // Add user to request object
    req.user = user as DatabaseUser;

    next();
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: 'Authentication service error',
    });
  }
}

/**
 * Pro subscription middleware - requires Pro/Premium tier
 * For features that require Pro subscription
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export async function requireProAccess(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    // Use ClerkAuthService to verify Pro user
    const { user, errorResponse } = await ClerkAuthService.verifyProUser(authHeader);

    if (errorResponse) {
      res.status(errorResponse.status).json(errorResponse);
      return;
    }

    // Add user to request object
    req.user = user as DatabaseUser;

    next();
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: 'Authentication service error',
    });
  }
}

/**
 * Optional authentication - for endpoints that work with or without auth
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    // Use ClerkAuthService to verify user if header is present
    const { user, errorResponse } = await ClerkAuthService.verifyUser(authHeader);

    if (!errorResponse && user) {
      req.user = user as DatabaseUser;
    }

    next();
  } catch (error: unknown) {
    // Continue without authentication for optional auth
    next();
  }
}

/**
 * Create authentication middleware with custom options
 * @param options Middleware options
 * @returns Authentication middleware function
 */
export function createAuthMiddleware(options: {
  requireAuth?: boolean;
  requirePro?: boolean;
  optional?: boolean;
} = {}) {
  const { requireAuth = true, requirePro = false, optional = false } = options;

  if (optional) {
    return optionalAuth;
  }

  if (requirePro) {
    return requireProAccess;
  }

  if (requireAuth) {
    return authenticateUser;
  }

  // Default to no authentication
  return (_req: Request, _res: Response, next: NextFunction): void => {
    next();
  };
} 