# Backend Monetization System - Editia Core

## Overview

The backend monetization system provides a centralized way to handle subscription-based access control and usage tracking for all Editia services. It consists of a core service (`MonetizationService`) and Express middleware for easy integration.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Express Application                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Auth Middleware│  │ Monetization    │  │  Route       │ │
│  │                 │  │   Middleware    │  │  Handler     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│              MonetizationService (Singleton)                │
├─────────────────────────────────────────────────────────────┤
│                    Supabase Database                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ user_usage  │  │feature_flags│  │ subscription_plans  │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. MonetizationService

The central service that handles all monetization logic.

**Key Features:**

- Singleton pattern for consistent state
- Caching for performance optimization
- Comprehensive error handling
- Development debugging tools

**Main Methods:**

- `checkFeatureAccess()` - Verify if user can access a feature
- `validateUsage()` - Check if user has remaining usage
- `checkMonetization()` - Comprehensive access + usage check
- `incrementUsage()` - Track usage after successful operations
- `getUserUsage()` - Get current usage data

### 2. Express Middleware

Pre-built middleware for common monetization scenarios.

**Available Middleware:**

- `videoGenerationMiddleware` - For video generation endpoints
- `sourceVideoUploadMiddleware` - For file upload endpoints
- `voiceCloneMiddleware` - For voice cloning endpoints
- `accountAnalysisMiddleware` - For analysis endpoints
- `scriptGenerationMiddleware` - For script generation (no usage increment)
- `chatAiMiddleware` - For AI chat (no usage increment)

## Quick Start

### 1. Initialize the Service

```typescript
import { MonetizationService } from 'editia-core';
import { createClient } from '@supabase/supabase-js';

// Initialize at app startup
MonetizationService.initialize({
  supabaseClient: createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  ),
  environment: process.env.NODE_ENV as 'development' | 'production' | 'test',
});
```

### 2. Use Preset Middleware

```typescript
import {
  videoGenerationMiddleware,
  createUsageIncrementMiddleware,
  userFriendlyMonetizationErrorHandler,
} from 'editia-core';

// Apply to video generation route
app.post(
  '/api/videos/generate',
  videoGenerationMiddleware,
  createUsageIncrementMiddleware(),
  async (req, res) => {
    // Your video generation logic here
    // Usage will be automatically incremented on success
    res.json({ success: true, videoUrl: '...' });
  }
);
```

### 3. Custom Middleware

```typescript
import { createMonetizationMiddleware } from 'editia-core';

const customMonetizationMiddleware = createMonetizationMiddleware({
  featureId: 'custom_feature',
  incrementUsage: true,
  action: 'video_generation',
  errorHandler: userFriendlyMonetizationErrorHandler,
});

app.post('/api/custom-endpoint', customMonetizationMiddleware, (req, res) => {
  // Your logic here
});
```

## Feature Configuration

### Feature Flags Table

The system uses a `feature_flags` table to define access requirements:

```sql
CREATE TABLE feature_flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  required_plan TEXT REFERENCES subscription_plans(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Predefined Features:**

- `video_generation` - Video generation (requires plan)
- `source_videos` - Source video upload (requires plan)
- `voice_clone` - Voice cloning (requires plan)
- `account_analysis` - Account analysis (requires plan)
- `script_generation` - Script generation (requires plan)
- `chat_ai` - AI chat (available to all)

### Usage Tracking

The system tracks usage in the `user_usage` table:

```sql
-- Key fields for usage tracking
videos_generated INT DEFAULT 0,
videos_generated_limit INT,
source_videos_used INT DEFAULT 0,
source_videos_limit INT,
voice_clones_used INT DEFAULT 0,
voice_clones_limit INT,
account_analysis_used INT DEFAULT 0,
account_analysis_limit INT,
```

## Response Format

### Success Response

```json
{
  "success": true,
  "videoUrl": "https://...",
  "remainingUsage": 14,
  "totalLimit": 15
}
```

### Error Response (Access Denied)

```json
{
  "success": false,
  "error": "Voice cloning is not available in your current plan.",
  "title": "Voice Cloning Not Available",
  "code": "FEATURE_ACCESS_DENIED",
  "upgrade": {
    "requiredPlan": "creator",
    "currentPlan": "free",
    "message": "Upgrade to access voice cloning features."
  },
  "limits": {
    "remaining": 0,
    "total": 0
  }
}
```

### Error Response (Usage Limit)

```json
{
  "success": false,
  "error": "You have reached your video generation limit for this month.",
  "title": "Video Generation Limit Reached",
  "code": "USAGE_LIMIT_REACHED",
  "limits": {
    "remaining": 0,
    "total": 15
  }
}
```

## Advanced Usage

### 1. Custom Error Handling

```typescript
const customErrorHandler = (
  req: Request,
  res: Response,
  result: MonetizationCheckResult
) => {
  // Your custom error logic
  res.status(403).json({
    error: 'Custom error message',
    upgradeUrl: '/upgrade',
    // ... other custom fields
  });
};

const customMiddleware = createMonetizationMiddleware({
  featureId: 'video_generation',
  incrementUsage: true,
  action: 'video_generation',
  errorHandler: customErrorHandler,
});
```

### 2. Manual Service Usage

```typescript
import { MonetizationService } from 'editia-core';

const monetizationService = MonetizationService.getInstance();

// Check access manually
const result = await monetizationService.checkMonetization(
  userId,
  'video_generation'
);

if (result.success) {
  // Proceed with operation
  await generateVideo();

  // Increment usage
  await monetizationService.incrementUsage(userId, 'video_generation');
} else {
  // Handle access denied
  res.status(403).json({ error: result.error });
}
```

### 3. Development Debugging

```typescript
// Get comprehensive debug info (development only)
const debugInfo = await monetizationService.getDebugInfo(userId);
console.log('Debug Info:', debugInfo);
```

## Integration Examples

### 1. Video Generation Endpoint

```typescript
app.post(
  '/api/videos/generate',
  authenticateUser, // Your auth middleware
  videoGenerationMiddleware,
  createUsageIncrementMiddleware(),
  async (req, res) => {
    try {
      const { script, sourceVideos } = req.body;

      // Generate video (your logic)
      const videoUrl = await generateVideo(script, sourceVideos);

      res.json({
        success: true,
        videoUrl,
        remainingUsage: req.monetization?.remainingUsage,
        totalLimit: req.monetization?.totalLimit,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
```

### 2. File Upload Endpoint

```typescript
app.post(
  '/api/videos/upload',
  authenticateUser,
  sourceVideoUploadMiddleware,
  createUsageIncrementMiddleware(),
  upload.single('video'), // Your file upload middleware
  async (req, res) => {
    try {
      const file = req.file;

      // Process upload (your logic)
      const videoId = await processVideoUpload(file);

      res.json({
        success: true,
        videoId,
        remainingUploads: req.monetization?.remainingUsage,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
```

### 3. Voice Cloning Endpoint

```typescript
app.post(
  '/api/voices/clone',
  authenticateUser,
  voiceCloneMiddleware,
  createUsageIncrementMiddleware(),
  async (req, res) => {
    try {
      const { audioFile } = req.body;

      // Clone voice (your logic)
      const voiceId = await cloneVoice(audioFile);

      res.json({
        success: true,
        voiceId,
        remainingClones: req.monetization?.remainingUsage,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
```

## Best Practices

### 1. Error Handling

- Always use appropriate error handlers
- Provide clear upgrade paths for users
- Log monetization failures for debugging

### 2. Performance

- The service includes caching (5-minute TTL)
- Use preset middleware when possible
- Avoid manual service calls in hot paths

### 3. Security

- Always validate user authentication before monetization checks
- Use RLS policies in Supabase as additional security layer
- Never trust client-side usage data

### 4. Monitoring

- Monitor usage patterns and limits
- Track upgrade conversion rates
- Alert on unusual usage spikes

## Troubleshooting

### Common Issues

1. **Service not initialized**

   ```
   Error: MonetizationService must be initialized with config first
   ```

   Solution: Call `MonetizationService.initialize()` at app startup

2. **User usage not found**

   ```
   Error: User usage not found
   ```

   Solution: Ensure user has a record in `user_usage` table

3. **Feature flag not found**
   ```
   Error: Feature requirements not found
   ```
   Solution: Add feature to `feature_flags` table

### Debug Mode

Enable debug logging in development:

```typescript
// Add to your middleware chain
app.use(logMonetizationChecks());
```

This will log all monetization checks to the console for debugging.

## Migration Guide

### From Manual Checks

**Before:**

```typescript
// Manual checks scattered throughout code
const user = await getUser(userId);
if (user.plan !== 'pro') {
  return res.status(403).json({ error: 'Pro plan required' });
}
```

**After:**

```typescript
// Centralized middleware
app.post('/api/feature', voiceCloneMiddleware, (req, res) => {
  // Your logic here - access already validated
});
```

### From RevenueCat Only

**Before:**

```typescript
// Only RevenueCat checks
const customerInfo = await Purchases.getCustomerInfo();
const hasPro = customerInfo?.entitlements.active['Pro'] !== undefined;
```

**After:**

```typescript
// Comprehensive checks including usage limits
const result = await monetizationService.checkMonetization(
  userId,
  'voice_clone'
);
if (result.success) {
  // Proceed with operation
}
```

This backend monetization system provides a robust, scalable foundation for managing subscription-based access control across all Editia services.
