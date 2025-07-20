# Migration Guide - Editia Core Types

## Overview

This guide helps you migrate from the old string-based types to the new strongly-typed system in Editia Core. The migration is designed to be **backward compatible** with gradual adoption.

## Breaking Changes Summary

| Change                                     | Impact | Migration Required                            |
| ------------------------------------------ | ------ | --------------------------------------------- |
| `UserUsage` type changed                   | Medium | Update imports or use compatibility layer     |
| Method signatures in `MonetizationService` | High   | Update calls or use compatibility functions   |
| Middleware configuration types             | Medium | Update configurations or use legacy constants |
| Export reorganization                      | Low    | Update imports if needed                      |

## Migration Strategies

### Strategy 1: Gradual Migration (Recommended)

Use the **compatibility layer** to migrate gradually without breaking existing code.

### Strategy 2: Immediate Migration

Update all code to use the new types immediately.

## Step-by-Step Migration

### 1. Update Imports

#### Before

```typescript
import { UserUsage } from '@editia/core/types/usage-tracking';
import { MonetizationService } from '@editia/core/services/monetization';
```

#### After

```typescript
// Option A: Use new types directly
import { UserUsage } from '@editia/core/types/usage-tracking';
import { MonetizationService } from '@editia/core/services/monetization';

// Option B: Use compatibility layer
import { UserUsageLegacy, toFeatureId } from '@editia/core/types';
```

### 2. Update Service Calls

#### Before

```typescript
const service = new MonetizationService(config);
const result = await service.checkFeatureAccess(userId, 'video_generation');
```

#### After

```typescript
// Option A: Use new types
import { FEATURES } from '@editia/core/types';
const service = new MonetizationService(config);
const result = await service.checkFeatureAccess(
  userId,
  FEATURES.VIDEO_GENERATION
);

// Option B: Use compatibility function
import { toFeatureId } from '@editia/core/types';
const service = new MonetizationService(config);
const result = await service.checkFeatureAccess(
  userId,
  toFeatureId('video_generation')
);
```

### 3. Update Middleware Configuration

#### Before

```typescript
import { createMonetizationMiddleware } from '@editia/core/middleware/monetization';

const middleware = createMonetizationMiddleware({
  featureId: 'video_generation',
  action: 'video_generation',
});
```

#### After

```typescript
// Option A: Use new constants
import { FEATURES, ACTIONS } from '@editia/core/types';
import { createMonetizationMiddleware } from '@editia/core/middleware/monetization';

const middleware = createMonetizationMiddleware({
  featureId: FEATURES.VIDEO_GENERATION,
  action: ACTIONS.VIDEO_GENERATION,
});

// Option B: Use legacy constants
import { LEGACY_FEATURES, LEGACY_ACTIONS } from '@editia/core/types';
import { createMonetizationMiddleware } from '@editia/core/middleware/monetization';

const middleware = createMonetizationMiddleware({
  featureId: LEGACY_FEATURES.VIDEO_GENERATION,
  action: LEGACY_ACTIONS.VIDEO_GENERATION,
});
```

### 4. Update Type Annotations

#### Before

```typescript
function processFeature(featureId: string) {
  // ...
}
```

#### After

```typescript
// Option A: Use new types
import { FeatureId } from '@editia/core/types';

function processFeature(featureId: FeatureId) {
  // ...
}

// Option B: Use legacy types
import { FeatureIdLegacy } from '@editia/core/types';

function processFeature(featureId: FeatureIdLegacy) {
  // ...
}
```

## Compatibility Layer Usage

### Converting Legacy Values

```typescript
import { toFeatureId, toAction, toUsageField } from '@editia/core/types';

// Convert legacy strings to new types
const featureId = toFeatureId('video_generation'); // Returns FeatureId
const action = toAction('video_generation'); // Returns Action
const usageField = toUsageField('videos_generated'); // Returns UsageField
```

### Using Legacy Types

```typescript
import { UserUsageLegacy, toLegacyUserUsage } from '@editia/core/types';

// Convert new UserUsage to legacy format
const newUsage: UserUsage = await getUserUsage(userId);
const legacyUsage: UserUsageLegacy = toLegacyUserUsage(newUsage);
```

### Showing Deprecation Warnings

```typescript
import { showDeprecationWarning } from '@editia/core/types';

// Show warning in development
showDeprecationWarning('string-based featureId', 'FEATURES.VIDEO_GENERATION');
```

## Migration Checklist

### Phase 1: Preparation

- [ ] Update package.json to new version
- [ ] Review breaking changes
- [ ] Identify affected files

### Phase 2: Gradual Migration

- [ ] Update imports to use new types
- [ ] Replace string literals with constants
- [ ] Update function signatures
- [ ] Test each change

### Phase 3: Cleanup

- [ ] Remove compatibility layer usage
- [ ] Remove legacy type annotations
- [ ] Update documentation
- [ ] Run full test suite

## Common Issues and Solutions

### Issue 1: TypeScript Errors with String Literals

**Error:**

```typescript
Argument of type '"video_generation"' is not assignable to parameter of type 'FeatureId'
```

**Solution:**

```typescript
// Use constants instead of string literals
import { FEATURES } from '@editia/core/types';
const featureId = FEATURES.VIDEO_GENERATION;
```

### Issue 2: Import Path Changes

**Error:**

```typescript
Module not found: Can't resolve '@editia/core/types/usage-tracking'
```

**Solution:**

```typescript
// Use main index file
import { UserUsage } from '@editia/core/types';
```

### Issue 3: Middleware Configuration Errors

**Error:**

```typescript
Type '"video_generation"' is not assignable to type 'FeatureId'
```

**Solution:**

```typescript
// Use constants in middleware config
import { FEATURES, ACTIONS } from '@editia/core/types';

const middleware = createMonetizationMiddleware({
  featureId: FEATURES.VIDEO_GENERATION,
  action: ACTIONS.VIDEO_GENERATION,
});
```

## Testing Migration

### 1. Type Checking

```bash
# Run TypeScript compiler
npx tsc --noEmit

# Check for type errors
npx tsc --strict --noEmit
```

### 2. Runtime Testing

```bash
# Run tests
npm test

# Run integration tests
npm run test:integration
```

### 3. Manual Testing

- Test all monetization features
- Verify middleware functionality
- Check usage tracking
- Validate error handling

## Rollback Plan

If issues arise during migration:

1. **Revert to previous version:**

   ```bash
   npm install @editia/core@previous-version
   ```

2. **Use compatibility layer:**

   ```typescript
   import { LEGACY_FEATURES, toFeatureId } from '@editia/core/types';
   ```

3. **Gradual migration:**
   - Migrate one file at a time
   - Use compatibility functions
   - Test thoroughly after each change

## Support

If you encounter issues during migration:

1. Check the [Types Architecture Documentation](./types-architecture.md)
2. Review the [Compatibility Layer](./compatibility.ts)
3. Open an issue with detailed error information
4. Use the compatibility layer as a temporary solution

## Benefits After Migration

- **Type Safety**: Compile-time error detection
- **Better IDE Support**: Autocomplete and refactoring
- **Maintainability**: Centralized type definitions
- **Documentation**: Self-documenting code
- **Performance**: No runtime type checking needed
