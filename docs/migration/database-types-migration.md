# Migration Guide: Database Types Centralization

## Overview

This guide explains how to migrate from individual Supabase type files to the centralized type system in `editia-core`. The new system provides better developer experience, type safety, and consistency across all projects.

## What's New

### 1. **Centralized Type Mapping**

- All database types are now managed in `editia-core`
- Raw Supabase types are mapped to clean abstractions
- Type safety with validation utilities

### 2. **React Native Hooks**

- `useEditiaMonetization` hook for unified monetization logic
- Automatic RevenueCat integration
- Feature access control built-in

### 3. **Utility Functions**

- Plan hierarchy management
- Usage calculation utilities
- Type guards and validators

## Migration Steps

### Step 1: Update Package Dependencies

Add `editia-core` to your project:

```bash
npm install editia-core@^1.1.0
```

### Step 2: Import Types from editia-core

**Before:**

```typescript
// Old way - importing from local files
import { Database } from '../config/supabase-types';
import type { User } from '../types/user.types';
```

**After:**

```typescript
// New way - importing from editia-core
import {
  Database,
  User,
  UserUsage,
  PlanIdentifier,
  hasPlanAccess,
  calculateRemainingUsage,
} from 'editia-core';
```

### Step 3: Update Supabase Client Configuration

**Before:**

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase-types';

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

**After:**

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from 'editia-core';

// You can still use the same pattern, but now Database comes from editia-core
export const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

### Step 4: Replace RevenueCat Logic with useEditiaMonetization

**Before:**

```typescript
// Old RevenueCat provider
import { RevenueCatProvider, useRevenueCat } from '@/contexts/providers/RevenueCat';

export const App = () => (
  <RevenueCatProvider>
    <YourApp />
  </RevenueCatProvider>
);

// In components
const { currentPlan, videosRemaining, presentPaywall } = useRevenueCat();
```

**After:**

```typescript
// New unified hook
import { useEditiaMonetization } from 'editia-core';

const MyComponent = () => {
  const {
    currentPlan,
    videosRemaining,
    presentPaywall,
    checkFeatureAccess,
    getFeatureAccessInfo,
  } = useEditiaMonetization({
    revenueCatKeys: {
      apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!,
      google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!,
    },
    supabaseClient: supabase,
    environment: 'development',
  });

  // Check feature access
  const hasVideoAccess = checkFeatureAccess('video_generation');
  const accessInfo = getFeatureAccessInfo('video_generation');
};
```

### Step 5: Update Type Definitions

**Before:**

```typescript
// Local type definitions
export type DatabaseUser = Pick<
  Database['public']['Tables']['users']['Row'],
  'id' | 'email' | 'full_name' | 'avatar_url' | 'role' | 'clerk_user_id'
>;
```

**After:**

```typescript
// Use centralized types
import { User } from 'editia-core';

// User type is already properly abstracted
const user: User = {
  id: 'uuid',
  email: 'user@example.com',
  clerk_user_id: 'clerk_user_id',
  // ... other fields
};
```

### Step 6: Replace Manual Usage Calculations

**Before:**

```typescript
// Manual calculations
const videosRemaining = Math.max(
  0,
  userUsage.videos_generated_limit - userUsage.videos_generated
);
const hasReachedLimit =
  userUsage.videos_generated >= userUsage.videos_generated_limit;
```

**After:**

```typescript
// Utility functions
import { calculateRemainingUsage, hasReachedLimit } from 'editia-core';

const videosRemaining = calculateRemainingUsage(
  userUsage.videos_generated,
  userUsage.videos_generated_limit
);
const reachedLimit = hasReachedLimit(
  userUsage.videos_generated,
  userUsage.videos_generated_limit
);
```

### Step 7: Update Feature Access Logic

**Before:**

```typescript
// Manual plan checking
const canAccessVideoGeneration =
  currentPlan === 'creator' || currentPlan === 'pro';
```

**After:**

```typescript
// Built-in feature access
import { checkFeatureAccess, FEATURE_FLAGS } from 'editia-core';

const canAccessVideoGeneration = checkFeatureAccess(
  FEATURE_FLAGS.VIDEO_GENERATION
);
```

## Advanced Usage

### Using Raw Types (Advanced)

If you need access to raw Supabase types for advanced operations:

```typescript
import {
  TableRow,
  TableInsert,
  TableUpdate,
  RawUser,
  RawUserInsert,
  RawUserUpdate,
} from 'editia-core';

// Raw table types
type UserRow = TableRow<'users'>;
type UserInsert = TableInsert<'users'>;
type UserUpdate = TableUpdate<'users'>;

// Or use the pre-mapped raw types
const rawUser: RawUser = {
  id: 'uuid',
  clerk_user_id: 'clerk_user_id',
  // ... all raw fields
};
```

### Type Transformation

For data validation and transformation:

```typescript
import { validateAndTransform } from 'editia-core';

// Validate and transform raw data
const user = validateAndTransform.user(rawUserData);
const userUsage = validateAndTransform.userUsage(rawUsageData);
```

### Custom Feature Access

For custom feature access logic:

```typescript
import { hasPlanAccess, getPlanLevel } from 'editia-core';

// Custom access control
const hasCustomAccess = (
  userPlan: PlanIdentifier,
  requiredPlan: PlanIdentifier
) => {
  return hasPlanAccess(userPlan, requiredPlan);
};

// Get plan hierarchy
const userLevel = getPlanLevel(currentPlan); // 0, 1, or 2
```

## Benefits of Migration

### 1. **Type Safety**

- All types are validated and consistent
- Type guards prevent runtime errors
- Better IntelliSense support

### 2. **Developer Experience**

- Single source of truth for types
- Utility functions for common operations
- Consistent API across projects

### 3. **Maintainability**

- Centralized type management
- Easier to update and extend
- Reduced code duplication

### 4. **Performance**

- Optimized type transformations
- Efficient feature access checking
- Minimal bundle size impact

## Troubleshooting

### Common Issues

1. **Type Mismatch Errors**
   - Ensure you're using the abstracted types from `editia-core`
   - Use type guards to validate data

2. **Missing Dependencies**
   - Make sure `editia-core` is properly installed
   - Check that you're importing from the correct paths

3. **RevenueCat Integration Issues**
   - Verify your RevenueCat keys are correct
   - Check that the user ID is provided to the hook

### Getting Help

If you encounter issues during migration:

1. Check the [API Reference](../api/README.md)
2. Review the [Setup Guide](../setup/README.md)
3. Look at the [Security Documentation](../auth/security.md)

## Next Steps

After completing the migration:

1. **Test thoroughly** - Ensure all features work as expected
2. **Update documentation** - Update your project's documentation
3. **Remove old files** - Clean up old type files and RevenueCat providers
4. **Share feedback** - Let us know about any issues or improvements needed
