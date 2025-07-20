# Editia Core Types Architecture

## Overview

This document describes the new strongly-typed architecture for Editia Core's monetization and usage tracking system. The refactorization introduces strict typing for features, actions, and their relationships to improve maintainability and reduce errors.

## File Structure

```
src/types/
├── index.ts              # Main export file
├── database.ts           # Database types and utilities
├── monetization.ts       # Monetization-specific types
├── usage-tracking.ts     # Usage tracking types
└── constants.ts          # Constants and configuration
```

## Core Concepts

### 1. Features (FeatureId)

Features represent capabilities in the system that users can access. Each feature has specific requirements and usage limits.

```typescript
export const FEATURES = {
  VIDEO_GENERATION: 'video_generation',
  SOURCE_VIDEOS: 'source_videos',
  VOICE_CLONE: 'voice_clone',
  ACCOUNT_ANALYSIS: 'account_analysis',
  SCRIPT_CONVERSATIONS: 'script_conversations',
  SCRIPT_GENERATION: 'script_generation',
  CHAT_AI: 'chat_ai',
} as const;

export type FeatureId = (typeof FEATURES)[keyof typeof FEATURES];
```

### 2. Actions (Action)

Actions represent specific operations that users can perform. Each action corresponds to a usage tracking field.

```typescript
export const ACTIONS = {
  VIDEO_GENERATION: 'video_generation',
  SOURCE_VIDEO_UPLOAD: 'source_video_upload',
  VOICE_CLONE: 'voice_clone',
  ACCOUNT_ANALYSIS: 'account_analysis',
  SCRIPT_CONVERSATIONS: 'script_conversations',
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];
```

### 3. Usage Fields (UsageField)

Usage fields represent the database columns that track usage for different resources.

```typescript
export const USAGE_FIELDS = {
  VIDEOS_GENERATED: 'videos_generated',
  SOURCE_VIDEOS_USED: 'source_videos_used',
  VOICE_CLONES_USED: 'voice_clones_used',
  ACCOUNT_ANALYSIS_USED: 'account_analysis_used',
  SCRIPT_CONVERSATIONS_USED: 'script_conversations_used',
} as const;

export type UsageField = (typeof USAGE_FIELDS)[keyof typeof USAGE_FIELDS];
```

## Mapping Relationships

### Feature → Action Mapping

```typescript
export const FEATURE_TO_ACTION_MAP: Record<FeatureId, Action> = {
  [FEATURES.VIDEO_GENERATION]: ACTIONS.VIDEO_GENERATION,
  [FEATURES.SOURCE_VIDEOS]: ACTIONS.SOURCE_VIDEO_UPLOAD,
  [FEATURES.VOICE_CLONE]: ACTIONS.VOICE_CLONE,
  [FEATURES.ACCOUNT_ANALYSIS]: ACTIONS.ACCOUNT_ANALYSIS,
  [FEATURES.SCRIPT_CONVERSATIONS]: ACTIONS.SCRIPT_CONVERSATIONS,
  [FEATURES.SCRIPT_GENERATION]: ACTIONS.SCRIPT_CONVERSATIONS, // Same action
  [FEATURES.CHAT_AI]: ACTIONS.SCRIPT_CONVERSATIONS, // Same action
} as const;
```

### Action → Usage Field Mapping

```typescript
export const ACTION_TO_USAGE_FIELD_MAP: Record<Action, UsageField> = {
  [ACTIONS.VIDEO_GENERATION]: USAGE_FIELDS.VIDEOS_GENERATED,
  [ACTIONS.SOURCE_VIDEO_UPLOAD]: USAGE_FIELDS.SOURCE_VIDEOS_USED,
  [ACTIONS.VOICE_CLONE]: USAGE_FIELDS.VOICE_CLONES_USED,
  [ACTIONS.ACCOUNT_ANALYSIS]: USAGE_FIELDS.ACCOUNT_ANALYSIS_USED,
  [ACTIONS.SCRIPT_CONVERSATIONS]: USAGE_FIELDS.SCRIPT_CONVERSATIONS_USED,
} as const;
```

## Utility Functions

### Type Validation

```typescript
// Check if a string is a valid feature ID
export function isValidFeatureId(value: string): value is FeatureId;

// Check if a string is a valid action
export function isValidAction(value: string): value is Action;

// Check if a string is a valid usage field
export function isValidUsageField(value: string): value is UsageField;
```

### Mapping Functions

```typescript
// Get the action corresponding to a feature
export function getActionForFeature(featureId: FeatureId): Action;

// Get the usage field corresponding to an action
export function getUsageFieldForAction(action: Action): UsageField;

// Get the usage field corresponding to a feature
export function getUsageFieldForFeature(featureId: FeatureId): UsageField;
```

## Usage Examples

### In MonetizationService

```typescript
// Before (string-based, error-prone)
const action = this.getActionForFeature(featureId); // Manual mapping
const field = this.getUsageFieldForAction(action); // Manual mapping

// After (type-safe, centralized)
const action = getActionForFeature(featureId); // Type-safe mapping
const field = getUsageFieldForAction(action); // Type-safe mapping
```

### In Middleware

```typescript
// Before (string literals)
export const videoGenerationMiddleware = createMonetizationMiddleware({
  featureId: 'video_generation', // String literal
  action: 'video_generation', // String literal
});

// After (constants)
export const videoGenerationMiddleware = createMonetizationMiddleware({
  featureId: FEATURES.VIDEO_GENERATION, // Type-safe constant
  action: ACTIONS.VIDEO_GENERATION, // Type-safe constant
});
```

### Type Safety Benefits

```typescript
// This will cause a TypeScript error
const invalidFeature: FeatureId = 'invalid_feature'; // ❌ Error

// This is type-safe
const validFeature: FeatureId = FEATURES.VIDEO_GENERATION; // ✅ Valid

// This will cause a TypeScript error
const invalidAction: Action = 'invalid_action'; // ❌ Error

// This is type-safe
const validAction: Action = ACTIONS.VIDEO_GENERATION; // ✅ Valid
```

## Migration Guide

### 1. Replace String Literals with Constants

```typescript
// Before
const featureId = 'video_generation';

// After
const featureId = FEATURES.VIDEO_GENERATION;
```

### 2. Use Type-Safe Functions

```typescript
// Before
const action = this.getActionForFeature(featureId);

// After
const action = getActionForFeature(featureId);
```

### 3. Update Function Signatures

```typescript
// Before
function checkFeatureAccess(featureId: string): Promise<FeatureAccessResult>;

// After
function checkFeatureAccess(featureId: FeatureId): Promise<FeatureAccessResult>;
```

### 4. Update Middleware Configurations

```typescript
// Before
export const videoGenerationMiddleware = createMonetizationMiddleware({
  featureId: 'video_generation',
  action: 'video_generation',
});

// After
export const videoGenerationMiddleware = createMonetizationMiddleware({
  featureId: FEATURES.VIDEO_GENERATION,
  action: ACTIONS.VIDEO_GENERATION,
});
```

## Benefits

1. **Type Safety**: Compile-time checking prevents invalid feature/action combinations
2. **Maintainability**: Centralized mappings make it easy to update relationships
3. **Consistency**: All parts of the system use the same constants
4. **Documentation**: Types serve as living documentation
5. **Refactoring**: IDE support for safe refactoring across the codebase
6. **Error Prevention**: Reduces runtime errors from typos or invalid values

## Constants

The system also includes centralized constants for:

- **Plan Limits**: Default limits for each subscription plan
- **Feature Flags**: IDs for feature flags in the database
- **Cache Timeouts**: Timeout values for different cache types
- **Error Codes**: Standard error codes for monetization
- **Usage Thresholds**: Warning thresholds for usage monitoring

These constants are exported from `constants.ts` and provide a single source of truth for configuration values.
