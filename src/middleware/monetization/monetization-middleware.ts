/**
 * Monetization Middleware for Express
 * 
 * This middleware integrates with the MonetizationService to protect
 * endpoints based on user subscription and usage limits.
 */

import { Request, Response, NextFunction } from 'express';
import {
  FeatureId,
  Action,
  MonetizationCheckResult,
  isValidFeatureId,
  isValidAction,
} from '../../types/monetization';

// ============================================================================
// TYPES
// ============================================================================

export interface MonetizationMiddlewareConfig {
  featureId: FeatureId;
  incrementUsage?: boolean;
  action?: Action;
  errorHandler?: (req: Request, res: Response, result: MonetizationCheckResult) => void;
}

export interface MonetizationRequest extends Request {
  monetization?: {
    hasAccess: boolean;
    currentPlan: string;
    remainingUsage: number;
    totalLimit: number;
    featureId: FeatureId;
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
      // Validate feature ID
      if (!isValidFeatureId(config.featureId)) {
        return res.status(400).json({
          success: false,
          error: `Invalid feature ID: ${config.featureId}`,
          code: 'INVALID_FEATURE_ID',
        });
      }

      // Validate action if provided
      if (config.action && !isValidAction(config.action)) {
        return res.status(400).json({
          success: false,
          error: `Invalid action: ${config.action}`,
          code: 'INVALID_ACTION',
        });
      }

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

    // Validate action
    if (!isValidAction(action)) {
      console.error(`Invalid action in usage increment middleware: ${action}`);
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

import { FEATURES, ACTIONS } from '../../types/monetization';
import { MonetizationService } from '../../services/monetization';

/**
 * Middleware for video generation endpoint
 */
export const videoGenerationMiddleware = createMonetizationMiddleware({
  featureId: FEATURES.VIDEO_GENERATION,
  incrementUsage: true,
  action: ACTIONS.VIDEO_GENERATION,
});

/**
 * Middleware for source video upload endpoint
 */
export const sourceVideoUploadMiddleware = createMonetizationMiddleware({
  featureId: FEATURES.SOURCE_VIDEOS,
  incrementUsage: true,
  action: ACTIONS.SOURCE_VIDEO_UPLOAD,
});

/**
 * Middleware for voice cloning endpoint
 */
export const voiceCloneMiddleware = createMonetizationMiddleware({
  featureId: FEATURES.VOICE_CLONE,
  incrementUsage: true,
  action: ACTIONS.VOICE_CLONE,
});

/**
 * Middleware for account analysis endpoint
 */
export const accountAnalysisMiddleware = createMonetizationMiddleware({
  featureId: FEATURES.ACCOUNT_ANALYSIS,
  incrementUsage: true,
  action: ACTIONS.ACCOUNT_ANALYSIS,
});

/**
 * Middleware for script generation
 */
export const scriptGenerationMiddleware = createMonetizationMiddleware({
  featureId: FEATURES.SCRIPT_GENERATION,
  incrementUsage: true,
  action: ACTIONS.SCRIPT_CONVERSATIONS,
});

/**
 * Middleware for script conversations
 */
export const scriptConversationsMiddleware = createMonetizationMiddleware({
  featureId: FEATURES.SCRIPT_CONVERSATIONS,
  incrementUsage: true,
  action: ACTIONS.SCRIPT_CONVERSATIONS,
});

/**
 * Middleware for chat AI (no usage increment)
 */
export const chatAiMiddleware = createMonetizationMiddleware({
  featureId: FEATURES.CHAT_AI,
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
    [FEATURES.VIDEO_GENERATION]: {
      title: 'Video Generation Limit Reached',
      message: 'You have reached your video generation limit for this month.',
      upgradeMessage: 'Upgrade to generate more videos.',
    },
    [FEATURES.SOURCE_VIDEOS]: {
      title: 'Source Video Upload Limit Reached',
      message: 'You have reached your source video upload limit.',
      upgradeMessage: 'Upgrade to upload more source videos.',
    },
    [FEATURES.VOICE_CLONE]: {
      title: 'Voice Cloning Not Available',
      message: 'Voice cloning is not available in your current plan.',
      upgradeMessage: 'Upgrade to access voice cloning features.',
    },
    [FEATURES.ACCOUNT_ANALYSIS]: {
      title: 'Account Analysis Limit Reached',
      message: 'You have reached your account analysis limit.',
      upgradeMessage: 'Upgrade for unlimited account analysis.',
    },
    [FEATURES.SCRIPT_CONVERSATIONS]: {
      title: 'Script Conversations Limit Reached',
      message: 'You have reached your script conversations limit.',
      upgradeMessage: 'Upgrade for unlimited script conversations.',
    },
    [FEATURES.SCRIPT_GENERATION]: {
      title: 'Script Generation Limit Reached',
      message: 'You have reached your script generation limit.',
      upgradeMessage: 'Upgrade for unlimited script generation.',
    },
    [FEATURES.CHAT_AI]: {
      title: 'Chat AI Not Available',
      message: 'Chat AI is not available in your current plan.',
      upgradeMessage: 'Upgrade to access Chat AI features.',
    },
  };

  const featureId = result.details?.featureId || FEATURES.VIDEO_GENERATION;
  const featureMessages = messages[featureId] || {
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