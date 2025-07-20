/**
 * Monetization Middleware for Express
 * 
 * This middleware integrates with the MonetizationService to protect
 * endpoints based on user subscription and usage limits.
 */

import { Request, Response, NextFunction } from 'express';
import { MonetizationService, MonetizationCheckResult } from '../../services/monetization/monetization-service';

// ============================================================================
// TYPES
// ============================================================================

export interface MonetizationMiddlewareConfig {
  featureId: string;
  incrementUsage?: boolean;
  action?: 'video_generation' | 'source_video_upload' | 'voice_clone' | 'account_analysis';
  errorHandler?: (req: Request, res: Response, result: MonetizationCheckResult) => void;
}

export interface MonetizationRequest extends Request {
  monetization?: {
    hasAccess: boolean;
    currentPlan: string;
    remainingUsage: number;
    totalLimit: number;
    featureId: string;
  };
}

// ============================================================================
// MIDDLEWARE FACTORY
// ============================================================================

/**
 * Create monetization middleware for a specific feature
 */
export function createMonetizationMiddleware(config: MonetizationMiddlewareConfig) {
  return async (req: MonetizationRequest, res: Response, next: NextFunction) => {
    try {
      // Get user ID from request (assuming it's set by auth middleware)
      const userId = (req as any).user?.id || (req as any).userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
          code: 'AUTHENTICATION_REQUIRED',
        });
      }

      // Get monetization service instance
      const monetizationService = MonetizationService.getInstance();

      // Check monetization access
      const result = await monetizationService.checkMonetization(userId, config.featureId);

      // Store monetization info in request for later use
      req.monetization = {
        hasAccess: result.hasAccess,
        currentPlan: result.currentPlan,
        remainingUsage: result.remainingUsage,
        totalLimit: result.totalLimit,
        featureId: config.featureId,
      };

      // If access denied, return error
      if (!result.success) {
        if (config.errorHandler) {
          return config.errorHandler(req, res, result);
        }

        return res.status(403).json({
          success: false,
          error: result.error,
          code: result.hasAccess ? 'USAGE_LIMIT_REACHED' : 'FEATURE_ACCESS_DENIED',
          details: {
            featureId: config.featureId,
            requiredPlan: result.details?.requiredPlan,
            currentPlan: result.currentPlan,
            remainingUsage: result.remainingUsage,
            totalLimit: result.totalLimit,
          },
          upgrade: !result.hasAccess ? {
            requiredPlan: result.details?.requiredPlan,
            currentPlan: result.currentPlan,
          } : undefined,
        });
      }

      // If we should increment usage after successful operation
      if (config.incrementUsage && config.action) {
        // Store the action to increment later (after successful operation)
        (req as any).monetizationAction = config.action;
      }

      next();
    } catch (error) {
      console.error('Monetization middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'MONETIZATION_SERVICE_ERROR',
      });
    }
  };
}

// ============================================================================
// USAGE INCREMENTATION MIDDLEWARE
// ============================================================================

/**
 * Middleware to increment usage after successful operation
 * This should be placed AFTER the main operation middleware
 */
export function createUsageIncrementMiddleware() {
  return async (req: MonetizationRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const action = (req as any).monetizationAction;

    if (!action) {
      return next();
    }

    // Override res.send to intercept the response
    res.send = function(body: any) {
      try {
        const responseBody = typeof body === 'string' ? JSON.parse(body) : body;

        // Only increment usage if the operation was successful
        if (responseBody.success !== false && res.statusCode < 400) {
          const userId = (req as any).user?.id || (req as any).userId;
          const monetizationService = MonetizationService.getInstance();

          // Increment usage asynchronously (don't wait for it)
          monetizationService.incrementUsage(userId, action).catch(error => {
            console.error('Error incrementing usage:', error);
          });
        }
      } catch (error) {
        console.error('Error in usage increment middleware:', error);
      }

      // Call original send
      return originalSend.call(this, body);
    };

    next();
  };
}

// ============================================================================
// HELPER MIDDLEWARE
// ============================================================================

/**
 * Middleware to add monetization info to response headers
 */
export function addMonetizationHeaders() {
  return (req: MonetizationRequest, res: Response, next: NextFunction) => {
    if (req.monetization) {
      res.set({
        'X-Monetization-HasAccess': req.monetization.hasAccess.toString(),
        'X-Monetization-CurrentPlan': req.monetization.currentPlan,
        'X-Monetization-RemainingUsage': req.monetization.remainingUsage.toString(),
        'X-Monetization-TotalLimit': req.monetization.totalLimit.toString(),
        'X-Monetization-FeatureId': req.monetization.featureId,
      });
    }
    next();
  };
}

/**
 * Middleware to log monetization checks (development only)
 */
export function logMonetizationChecks() {
  return (req: MonetizationRequest, res: Response, next: NextFunction) => {
    if (req.monetization) {
      console.log('🔒 Monetization Check:', {
        userId: (req as any).user?.id || (req as any).userId,
        featureId: req.monetization.featureId,
        hasAccess: req.monetization.hasAccess,
        currentPlan: req.monetization.currentPlan,
        remainingUsage: req.monetization.remainingUsage,
        totalLimit: req.monetization.totalLimit,
        path: req.path,
        method: req.method,
      });
    }
    next();
  };
}

// ============================================================================
// PRESET MIDDLEWARE FOR COMMON FEATURES
// ============================================================================

/**
 * Middleware for video generation endpoint
 */
export const videoGenerationMiddleware = createMonetizationMiddleware({
  featureId: 'video_generation',
  incrementUsage: true,
  action: 'video_generation',
});

/**
 * Middleware for source video upload endpoint
 */
export const sourceVideoUploadMiddleware = createMonetizationMiddleware({
  featureId: 'source_videos',
  incrementUsage: true,
  action: 'source_video_upload',
});

/**
 * Middleware for voice cloning endpoint
 */
export const voiceCloneMiddleware = createMonetizationMiddleware({
  featureId: 'voice_clone',
  incrementUsage: true,
  action: 'voice_clone',
});

/**
 * Middleware for account analysis endpoint
 */
export const accountAnalysisMiddleware = createMonetizationMiddleware({
  featureId: 'account_analysis',
  incrementUsage: true,
  action: 'account_analysis',
});

/**
 * Middleware for script generation (no usage increment)
 */
export const scriptGenerationMiddleware = createMonetizationMiddleware({
  featureId: 'script_generation',
  incrementUsage: false,
});

/**
 * Middleware for chat AI (no usage increment)
 */
export const chatAiMiddleware = createMonetizationMiddleware({
  featureId: 'chat_ai',
  incrementUsage: false,
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

/**
 * Default error handler for monetization failures
 */
export function defaultMonetizationErrorHandler(
  req: Request,
  res: Response,
  result: MonetizationCheckResult
) {
  const errorResponse = {
    success: false,
    error: result.error,
    code: result.hasAccess ? 'USAGE_LIMIT_REACHED' : 'FEATURE_ACCESS_DENIED',
    details: {
      featureId: result.details?.featureId,
      requiredPlan: result.details?.requiredPlan,
      currentPlan: result.currentPlan,
      remainingUsage: result.remainingUsage,
      totalLimit: result.totalLimit,
    },
  };

  // Add upgrade information if access is denied
  if (!result.hasAccess) {
    (errorResponse as any).upgrade = {
      requiredPlan: result.details?.requiredPlan,
      currentPlan: result.currentPlan,
      message: `This feature requires a ${result.details?.requiredPlan} plan. You currently have a ${result.currentPlan} plan.`,
    };
  }

  return res.status(403).json(errorResponse);
}

/**
 * Custom error handler that returns a more user-friendly response
 */
export function userFriendlyMonetizationErrorHandler(
  req: Request,
  res: Response,
  result: MonetizationCheckResult
) {
  const messages = {
    'video_generation': {
      title: 'Video Generation Limit Reached',
      message: 'You have reached your video generation limit for this month.',
      upgradeMessage: 'Upgrade to generate more videos.',
    },
    'source_videos': {
      title: 'Source Video Upload Limit Reached',
      message: 'You have reached your source video upload limit.',
      upgradeMessage: 'Upgrade to upload more source videos.',
    },
    'voice_clone': {
      title: 'Voice Cloning Not Available',
      message: 'Voice cloning is not available in your current plan.',
      upgradeMessage: 'Upgrade to access voice cloning features.',
    },
    'account_analysis': {
      title: 'Account Analysis Limit Reached',
      message: 'You have reached your account analysis limit.',
      upgradeMessage: 'Upgrade for unlimited account analysis.',
    },
  };

  const featureId = result.details?.featureId || 'unknown';
  const featureMessages = messages[featureId as keyof typeof messages] || {
    title: 'Feature Access Denied',
    message: 'This feature is not available in your current plan.',
    upgradeMessage: 'Upgrade to access this feature.',
  };

  return res.status(403).json({
    success: false,
    error: featureMessages.message,
    title: featureMessages.title,
    code: result.hasAccess ? 'USAGE_LIMIT_REACHED' : 'FEATURE_ACCESS_DENIED',
    upgrade: !result.hasAccess ? {
      requiredPlan: result.details?.requiredPlan,
      currentPlan: result.currentPlan,
      message: featureMessages.upgradeMessage,
    } : undefined,
    limits: {
      remaining: result.remainingUsage,
      total: result.totalLimit,
    },
  });
} 