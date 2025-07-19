# Integration Examples - Backend Monetization System

## Overview

This document provides practical examples of how to integrate the Editia Core monetization system into your Express.js applications.

## Example 1: Video Generation API

### Complete Implementation

```typescript
// server.ts
import express from 'express';
import {
  MonetizationService,
  videoGenerationMiddleware,
  createUsageIncrementMiddleware,
  userFriendlyMonetizationErrorHandler,
} from 'editia-core';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

// Initialize monetization service
MonetizationService.initialize({
  supabaseClient: createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  ),
  environment: process.env.NODE_ENV as 'development' | 'production' | 'test',
});

// Authentication middleware (your implementation)
const authenticateUser = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Your auth logic here
  req.user = { id: 'user-123' }; // Set user ID
  next();
};

// Video generation endpoint with monetization
app.post(
  '/api/videos/generate',
  authenticateUser,
  videoGenerationMiddleware,
  createUsageIncrementMiddleware(),
  async (req, res) => {
    try {
      const { script, sourceVideos, voiceId } = req.body;
      const userId = req.user.id;

      // Your video generation logic here
      const videoUrl = await generateVideo({
        script,
        sourceVideos,
        voiceId,
        userId,
      });

      // Response includes monetization info
      res.json({
        success: true,
        videoUrl,
        remainingUsage: req.monetization?.remainingUsage,
        totalLimit: req.monetization?.totalLimit,
        message: 'Video generated successfully!',
      });
    } catch (error) {
      console.error('Video generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate video',
      });
    }
  }
);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Test the Endpoint

```bash
# Test with free user (should fail)
curl -X POST http://localhost:3000/api/videos/generate \
  -H "Authorization: Bearer free-user-token" \
  -H "Content-Type: application/json" \
  -d '{"script": "Hello world", "sourceVideos": []}'

# Expected response:
{
  "success": false,
  "error": "Video generation is not available in your current plan.",
  "title": "Video Generation Not Available",
  "code": "FEATURE_ACCESS_DENIED",
  "upgrade": {
    "requiredPlan": "creator",
    "currentPlan": "free",
    "message": "Upgrade to access video generation features."
  }
}

# Test with creator user (should succeed)
curl -X POST http://localhost:3000/api/videos/generate \
  -H "Authorization: Bearer creator-user-token" \
  -H "Content-Type: application/json" \
  -d '{"script": "Hello world", "sourceVideos": []}'

# Expected response:
{
  "success": true,
  "videoUrl": "https://example.com/video.mp4",
  "remainingUsage": 14,
  "totalLimit": 15,
  "message": "Video generated successfully!"
}
```

## Example 2: File Upload with Usage Tracking

```typescript
// upload-service.ts
import multer from 'multer';
import {
  sourceVideoUploadMiddleware,
  createUsageIncrementMiddleware,
} from 'editia-core';

const upload = multer({ dest: 'uploads/' });

// Source video upload endpoint
app.post(
  '/api/videos/upload',
  authenticateUser,
  sourceVideoUploadMiddleware,
  upload.single('video'),
  createUsageIncrementMiddleware(),
  async (req, res) => {
    try {
      const file = req.file;
      const userId = req.user.id;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No video file provided',
        });
      }

      // Process the uploaded video
      const videoId = await processVideoUpload(file, userId);

      res.json({
        success: true,
        videoId,
        remainingUploads: req.monetization?.remainingUsage,
        totalUploads: req.monetization?.totalLimit,
        message: 'Video uploaded successfully!',
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload video',
      });
    }
  }
);
```

## Example 3: Voice Cloning Service

```typescript
// voice-service.ts
import {
  voiceCloneMiddleware,
  createUsageIncrementMiddleware,
} from 'editia-core';

// Voice cloning endpoint
app.post(
  '/api/voices/clone',
  authenticateUser,
  voiceCloneMiddleware,
  upload.single('audio'),
  createUsageIncrementMiddleware(),
  async (req, res) => {
    try {
      const audioFile = req.file;
      const { voiceName } = req.body;
      const userId = req.user.id;

      if (!audioFile) {
        return res.status(400).json({
          success: false,
          error: 'No audio file provided',
        });
      }

      // Clone the voice using ElevenLabs or similar service
      const voiceId = await cloneVoice(audioFile, voiceName, userId);

      res.json({
        success: true,
        voiceId,
        voiceName,
        remainingClones: req.monetization?.remainingUsage,
        totalClones: req.monetization?.totalLimit,
        message: 'Voice cloned successfully!',
      });
    } catch (error) {
      console.error('Voice cloning error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clone voice',
      });
    }
  }
);
```

## Example 4: Account Analysis API

```typescript
// analysis-service.ts
import {
  accountAnalysisMiddleware,
  createUsageIncrementMiddleware,
} from 'editia-core';

// Account analysis endpoint
app.post(
  '/api/analysis/account',
  authenticateUser,
  accountAnalysisMiddleware,
  createUsageIncrementMiddleware(),
  async (req, res) => {
    try {
      const { platform, username } = req.body;
      const userId = req.user.id;

      // Perform account analysis
      const analysis = await analyzeAccount(platform, username, userId);

      res.json({
        success: true,
        analysis,
        remainingAnalyses: req.monetization?.remainingUsage,
        totalAnalyses: req.monetization?.totalLimit,
        message: 'Account analysis completed!',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze account',
      });
    }
  }
);
```

## Example 5: Custom Feature with Manual Checks

```typescript
// custom-feature.ts
import { createMonetizationMiddleware, MonetizationService } from 'editia-core';

// Custom feature with manual monetization checks
app.post('/api/custom-feature', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const monetizationService = MonetizationService.getInstance();

    // Manual check for custom feature
    const result = await monetizationService.checkMonetization(
      userId,
      'custom_feature'
    );

    if (!result.success) {
      return res.status(403).json({
        success: false,
        error: result.error,
        code: result.hasAccess
          ? 'USAGE_LIMIT_REACHED'
          : 'FEATURE_ACCESS_DENIED',
        upgrade: !result.hasAccess
          ? {
              requiredPlan: result.details?.requiredPlan,
              currentPlan: result.currentPlan,
            }
          : undefined,
      });
    }

    // Proceed with custom feature logic
    const result = await performCustomFeature(req.body);

    // Manually increment usage
    await monetizationService.incrementUsage(userId, 'video_generation');

    res.json({
      success: true,
      result,
      remainingUsage: result.remainingUsage,
      totalLimit: result.totalLimit,
    });
  } catch (error) {
    console.error('Custom feature error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform custom feature',
    });
  }
});
```

## Example 6: Script Generation (No Usage Increment)

```typescript
// script-service.ts
import { scriptGenerationMiddleware } from 'editia-core';

// Script generation endpoint (no usage increment)
app.post(
  '/api/scripts/generate',
  authenticateUser,
  scriptGenerationMiddleware,
  async (req, res) => {
    try {
      const { prompt, style } = req.body;
      const userId = req.user.id;

      // Generate script using AI
      const script = await generateScript(prompt, style, userId);

      res.json({
        success: true,
        script,
        message: 'Script generated successfully!',
      });
    } catch (error) {
      console.error('Script generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate script',
      });
    }
  }
);
```

## Example 7: Chat AI (Available to All)

```typescript
// chat-service.ts
import { chatAiMiddleware } from 'editia-core';

// Chat AI endpoint (available to all plans)
app.post(
  '/api/chat/ai',
  authenticateUser,
  chatAiMiddleware,
  async (req, res) => {
    try {
      const { message, context } = req.body;
      const userId = req.user.id;

      // Process AI chat
      const response = await processAiChat(message, context, userId);

      res.json({
        success: true,
        response,
        message: 'AI response generated!',
      });
    } catch (error) {
      console.error('Chat AI error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process chat',
      });
    }
  }
);
```

## Example 8: Custom Error Handler

```typescript
// custom-error-handler.ts
import { createMonetizationMiddleware } from 'editia-core';

// Custom error handler for better UX
const customErrorHandler = (req: any, res: any, result: any) => {
  const errorMessages = {
    video_generation: {
      title: 'Upgrade to Generate Videos',
      message: 'Start creating amazing videos with our Creator plan!',
      cta: 'Upgrade Now',
    },
    voice_clone: {
      title: 'Unlock Voice Cloning',
      message: 'Clone your voice and make your videos more personal!',
      cta: 'Get Creator Plan',
    },
    account_analysis: {
      title: 'Analyze Your Account',
      message: 'Get insights into your content performance!',
      cta: 'Upgrade to Pro',
    },
  };

  const featureId = result.details?.featureId;
  const messages = errorMessages[featureId] || {
    title: 'Feature Not Available',
    message: 'This feature is not available in your current plan.',
    cta: 'Upgrade',
  };

  res.status(403).json({
    success: false,
    error: messages.message,
    title: messages.title,
    code: result.hasAccess ? 'USAGE_LIMIT_REACHED' : 'FEATURE_ACCESS_DENIED',
    upgrade: {
      requiredPlan: result.details?.requiredPlan,
      currentPlan: result.currentPlan,
      cta: messages.cta,
      upgradeUrl: `/upgrade?plan=${result.details?.requiredPlan}`,
    },
    limits: {
      remaining: result.remainingUsage,
      total: result.totalLimit,
    },
  });
};

// Use custom error handler
const customVideoMiddleware = createMonetizationMiddleware({
  featureId: 'video_generation',
  incrementUsage: true,
  action: 'video_generation',
  errorHandler: customErrorHandler,
});

app.post(
  '/api/videos/generate',
  authenticateUser,
  customVideoMiddleware,
  createUsageIncrementMiddleware(),
  async (req, res) => {
    // Your video generation logic
  }
);
```

## Example 9: Development Debugging

```typescript
// debug-service.ts
import { MonetizationService, logMonetizationChecks } from 'editia-core';

// Add debug logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(logMonetizationChecks());
}

// Debug endpoint (development only)
app.get(
  '/api/debug/monetization/:userId',
  authenticateUser,
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const monetizationService = MonetizationService.getInstance();

      // Get comprehensive debug info
      const debugInfo = await monetizationService.getDebugInfo(userId);

      res.json({
        success: true,
        debugInfo,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);
```

## Example 10: Complete Express App Setup

```typescript
// app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {
  MonetizationService,
  videoGenerationMiddleware,
  sourceVideoUploadMiddleware,
  voiceCloneMiddleware,
  accountAnalysisMiddleware,
  createUsageIncrementMiddleware,
  addMonetizationHeaders,
} from 'editia-core';
import { createClient } from '@supabase/supabase-js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize monetization service
MonetizationService.initialize({
  supabaseClient: createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  ),
  environment: process.env.NODE_ENV as 'development' | 'production' | 'test',
});

// Global middleware
app.use(addMonetizationHeaders());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Video generation routes
app.post(
  '/api/videos/generate',
  authenticateUser,
  videoGenerationMiddleware,
  createUsageIncrementMiddleware(),
  videoGenerationHandler
);

app.post(
  '/api/videos/upload',
  authenticateUser,
  sourceVideoUploadMiddleware,
  createUsageIncrementMiddleware(),
  upload.single('video'),
  videoUploadHandler
);

// Voice routes
app.post(
  '/api/voices/clone',
  authenticateUser,
  voiceCloneMiddleware,
  createUsageIncrementMiddleware(),
  upload.single('audio'),
  voiceCloneHandler
);

// Analysis routes
app.post(
  '/api/analysis/account',
  authenticateUser,
  accountAnalysisMiddleware,
  createUsageIncrementMiddleware(),
  accountAnalysisHandler
);

// Error handling
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Global error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

export default app;
```

These examples demonstrate how to integrate the monetization system into various types of endpoints and handle different scenarios. The system is designed to be flexible and easy to use while providing comprehensive access control and usage tracking.
