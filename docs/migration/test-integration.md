# Test Integration Guide: Database Types Centralization

## Overview

This guide shows how to test the new centralized database types and React Native hooks in the `editia-core` package. The goal is to verify that the types work correctly and that the hooks provide the expected functionality.

## Prerequisites

1. **Updated Package**: Make sure you have the latest version of `editia-core` (v1.2.0+)
2. **Supabase Client**: A configured Supabase client instance
3. **Test Environment**: A development environment with test data

## Step 1: Install Updated Package

```bash
npm install editia-core@^1.2.0
```

## Step 2: Test Type Imports

Create a test file to verify that all types are properly exported:

```typescript
// test-types.ts
import {
  // Core types
  Database,
  TableRow,
  TableInsert,
  TableUpdate,

  // Abstracted types
  User,
  UserUsage,
  SubscriptionPlan,
  FeatureFlag,
  PlanIdentifier,

  // Utility functions
  hasPlanAccess,
  calculateRemainingUsage,
  isValidPlanIdentifier,

  // Constants
  FEATURE_FLAGS,
  DEFAULT_PLAN_LIMITS,
} from 'editia-core';

// Test type usage
const testUser: User = {
  id: 'test-id',
  clerk_user_id: 'clerk-test-id',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'user',
};

const testUsage: UserUsage = {
  user_id: 'test-id',
  current_plan_id: 'free',
  videos_generated: 0,
  videos_generated_limit: 1,
  source_videos_used: 0,
  source_videos_limit: 5,
  voice_clones_used: 0,
  voice_clones_limit: 0,
  account_analysis_used: 0,
  account_analysis_limit: 1,
  next_reset_date: new Date().toISOString(),
};

// Test utility functions
console.log('Plan access test:', hasPlanAccess('pro', 'creator')); // true
console.log('Usage calculation:', calculateRemainingUsage(2, 10)); // 8
console.log('Feature flags:', FEATURE_FLAGS.VIDEO_GENERATION); // 'video_generation'

console.log('✅ All types imported successfully!');
```

## Step 3: Test React Native Hook

Create a test component to verify the hook functionality:

```typescript
// TestHook.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useEditiaMonetization } from 'editia-core';
import { createClient } from '@supabase/supabase-js';

// Create a test Supabase client
const supabaseClient = createClient(
  'your-supabase-url',
  'your-supabase-anon-key'
);

const TestHook: React.FC = () => {
  const {
    isLoading,
    isReady,
    currentPlan,
    userUsage,
    videosRemaining,
    sourceVideosRemaining,
    voiceClonesRemaining,
    accountAnalysisRemaining,
    checkFeatureAccess,
    getFeatureAccessInfo,
    presentPaywall,
    refreshUsage,
  } = useEditiaMonetization({
    supabaseClient,
    environment: 'development',
    userId: 'test-user-id', // Use a real user ID from your database
  });

  const testFeatureAccess = () => {
    const hasVideoAccess = checkFeatureAccess('video_generation');
    const accessInfo = getFeatureAccessInfo('video_generation');

    console.log('Video generation access:', hasVideoAccess);
    console.log('Access info:', accessInfo);
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!isReady) {
    return <Text>Not ready</Text>;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        Editia Monetization Test
      </Text>

      <Text>Current Plan: {currentPlan}</Text>
      <Text>Videos Remaining: {videosRemaining}</Text>
      <Text>Source Videos Remaining: {sourceVideosRemaining}</Text>
      <Text>Voice Clones Remaining: {voiceClonesRemaining}</Text>
      <Text>Account Analysis Remaining: {accountAnalysisRemaining}</Text>

      <Button title="Test Feature Access" onPress={testFeatureAccess} />
      <Button title="Present Paywall" onPress={presentPaywall} />
      <Button title="Refresh Usage" onPress={refreshUsage} />
    </View>
  );
};

export default TestHook;
```

## Step 4: Test Database Integration

Create a test script to verify database operations:

```typescript
// test-database.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from 'editia-core';

const supabase = createClient<Database>(
  'your-supabase-url',
  'your-supabase-anon-key'
);

async function testDatabaseOperations() {
  try {
    // Test 1: Fetch subscription plans
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*');

    if (plansError) {
      console.error('Error fetching plans:', plansError);
    } else {
      console.log('✅ Subscription plans fetched:', plans.length);
    }

    // Test 2: Fetch user usage
    const { data: usage, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', 'test-user-id')
      .single();

    if (usageError) {
      console.error('Error fetching usage:', usageError);
    } else {
      console.log('✅ User usage fetched:', usage);
    }

    // Test 3: Fetch feature flags
    const { data: flags, error: flagsError } = await supabase
      .from('feature_flags')
      .select('*');

    if (flagsError) {
      console.error('Error fetching flags:', flagsError);
    } else {
      console.log('✅ Feature flags fetched:', flags.length);
    }
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testDatabaseOperations();
```

## Step 5: Test Type Safety

Create a test to verify that the types prevent common errors:

```typescript
// test-type-safety.ts
import { Database, TableRow, TableInsert } from 'editia-core';

// This should work - correct table name
type UserRow = TableRow<'users'>;
type UserInsert = TableInsert<'users'>;

// This should cause a TypeScript error (uncomment to test)
// type InvalidRow = TableRow<'invalid_table'>;

// Test database client typing
const supabase = createClient<Database>(
  'your-supabase-url',
  'your-supabase-anon-key'
);

// This should be properly typed
const testQuery = supabase
  .from('users')
  .select('id, email, clerk_user_id')
  .eq('id', 'test-id');

console.log('✅ Type safety tests passed!');
```

## Step 6: Integration Test in Server Primary

To test the integration in your server-primary project:

1. **Update package.json**:

```json
{
  "dependencies": {
    "editia-core": "^1.2.0"
  }
}
```

2. **Update Supabase client creation**:

```typescript
// Before
import { Database } from '../config/supabase-types';

// After
import { Database } from 'editia-core';

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

3. **Test a simple endpoint**:

```typescript
// test-endpoint.ts
import { supabase } from './config/supabase';

export async function testUserEndpoint(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error:', error);
    return null;
  }

  console.log('User data:', data);
  return data;
}
```

## Expected Results

After running these tests, you should see:

1. ✅ **Type Imports**: All types import without errors
2. ✅ **Hook Functionality**: The React Native hook provides expected data and functions
3. ✅ **Database Operations**: Queries work with proper typing
4. ✅ **Type Safety**: TypeScript catches incorrect table names or field references
5. ✅ **Integration**: Server-primary can use the centralized types

## Troubleshooting

### Common Issues

1. **Type Errors**: Make sure you're importing from `editia-core` and not local files
2. **Build Errors**: Ensure the package version is 1.2.0+
3. **Database Errors**: Verify your Supabase credentials and table structure
4. **Hook Errors**: Check that the Supabase client is properly configured

### Debug Steps

1. Check package version: `npm list editia-core`
2. Verify imports: `console.log(require('editia-core'))`
3. Test database connection: Run a simple query
4. Check TypeScript configuration: Ensure `skipLibCheck` is not interfering

## Next Steps

Once testing is successful:

1. **Update all projects** to use the centralized types
2. **Remove local type files** that are now duplicated
3. **Update documentation** to reference the centralized types
4. **Set up CI/CD** to automatically test type compatibility

This centralized approach will make it much easier to maintain type consistency across all projects in the Editia ecosystem.
