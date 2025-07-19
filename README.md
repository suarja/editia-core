# @editia/core

[![npm version](https://badge.fury.io/js/%40editia%2Fcore.svg)](https://badge.fury.io/js/%40editia%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Jest-red.svg)](https://jestjs.io/)

Core services and utilities for Editia applications - Authentication, Monetization, and Database Management.

## 🚀 Features

- **🔐 Unified Authentication**: Clerk + Supabase integration with Express middleware
- **💰 Monetization Services**: Feature flags, usage tracking, and subscription management
- **🗄️ Database Management**: Type-safe Supabase integration with automatic type generation
- **🛠️ Developer Experience**: Full TypeScript support, comprehensive testing, and detailed documentation

## 📦 Installation

```bash
npm install @editia/core
```

## 🏗️ Architecture

This package provides a unified layer for all Editia applications:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │    │  Server Primary  │    │ Server Analyzer │
│                 │    │                  │    │                 │
│ • useFeatureAccess│  │ • usageTrackingService│ │ • usageTrackingService│
│ • usageTrackingService│ │ • usageLimitMiddleware│ │ • usageLimitMiddleware│
│ • RevenueCat    │    │ • ResourceType   │    │ • ResourceType  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   @editia/core  │
                    │                 │
                    │ • Auth Service  │
                    │ • Feature Flags │
                    │ • Usage Tracking│
                    │ • Type Generation│
                    └─────────────────┘
```

## 🚀 Quick Start

### 1. Initialize the Package

```typescript
import { initializeEditiaCore } from '@editia/core';

// Initialize with your configuration
initializeEditiaCore({
  clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
  environment: 'production',
});
```

### 2. Use Authentication in Express

```typescript
import express from 'express';
import { authenticateUser, requireProAccess } from '@editia/core';

const app = express();

// Basic authentication
app.get('/api/user/profile', authenticateUser, (req, res) => {
  // req.user is now available with the authenticated user
  res.json({ user: req.user });
});

// Pro subscription required
app.get('/api/pro/features', requireProAccess, (req, res) => {
  // Only Pro users can access this endpoint
  res.json({ features: ['advanced-analytics', 'priority-support'] });
});
```

### 3. Use Authentication Service Directly

```typescript
import { ClerkAuthService, verifyUser, getUserId } from '@editia/core';

// Verify user from auth header
const authHeader = req.headers.authorization;
const { user, clerkUser, errorResponse } = await verifyUser(authHeader);

if (errorResponse) {
  // Handle authentication error
  return res.status(errorResponse.status).json(errorResponse);
}

// Get just the user ID
const userId = await getUserId(authHeader);
```

## 📚 API Reference

### Authentication

#### `initializeEditiaCore(config: AuthConfig)`

Initialize the package with your configuration.

```typescript
interface AuthConfig {
  clerkSecretKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  environment?: 'development' | 'production' | 'test';
}
```

#### `authenticateUser(req, res, next)`

Express middleware for basic authentication.

#### `requireProAccess(req, res, next)`

Express middleware that requires Pro subscription.

#### `optionalAuth(req, res, next)`

Express middleware for optional authentication.

#### `verifyUser(authHeader?: string)`

Verify a user from a Clerk JWT token.

```typescript
const result = await verifyUser('Bearer <clerk-jwt-token>');
// Returns: { user: DatabaseUser | null, clerkUser: ClerkUser | null, errorResponse: AuthErrorResponse | null }
```

#### `getUserId(authHeader?: string)`

Get the database user ID from a Clerk JWT token.

```typescript
const userId = await getUserId('Bearer <clerk-jwt-token>');
// Returns: string | null
```

#### `hasProAccess(authHeader?: string)`

Check if a user has Pro subscription access.

```typescript
const hasPro = await hasProAccess('Bearer <clerk-jwt-token>');
// Returns: boolean
```

### Logging

#### `Logger`

A unified logging utility for consistent logging across the package.

```typescript
import { Logger } from '@editia/core';

const logger = new Logger('MyService', 'info');
logger.info('Service started');
logger.error('An error occurred', error);
```

### Types

All TypeScript types are exported for use in your applications:

```typescript
import type {
  DatabaseUser,
  AuthResult,
  AuthErrorResponse,
  AuthenticatedRequest,
  AuthConfig,
} from '@editia/core';
```

## 🔧 Configuration

### Environment Variables

```bash
# Required
CLERK_SECRET_KEY=sk_test_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional
NODE_ENV=production
LOG_LEVEL=info
```

### Supabase Setup

1. Create a Supabase project
2. Set up the required tables (see Database Schema below)
3. Configure Row Level Security (RLS) policies
4. Get your project URL and anon key

### Clerk Setup

1. Create a Clerk application
2. Configure authentication providers
3. Get your secret key from the Clerk dashboard
4. Set up webhooks for user synchronization

## 🗄️ Database Schema

The package expects the following tables in your Supabase database:

### `users` Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  clerk_user_id TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `feature_flags` Table

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

### `user_usage` Table

```sql
CREATE TABLE user_usage (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  current_plan_id TEXT REFERENCES subscription_plans(id),
  videos_generated INTEGER DEFAULT 0,
  videos_generated_limit INTEGER NOT NULL,
  source_videos_used INTEGER DEFAULT 0,
  source_videos_limit INTEGER NOT NULL,
  voice_clones_used INTEGER DEFAULT 0,
  voice_clones_limit INTEGER NOT NULL,
  account_analysis_used INTEGER DEFAULT 0,
  account_analysis_limit INTEGER NOT NULL,
  next_reset_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `subscription_plans` Table

```sql
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  videos_generated_limit INTEGER NOT NULL,
  source_videos_limit INTEGER NOT NULL,
  voice_clones_limit INTEGER NOT NULL,
  account_analysis_limit INTEGER NOT NULL,
  is_unlimited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🧪 Testing

The package uses Vitest for fast and reliable testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Format code
npm run format
```

## 📖 Examples

### Express Server Setup

```typescript
import express from 'express';
import {
  initializeEditiaCore,
  authenticateUser,
  requireProAccess,
} from '@editia/core';

const app = express();

// Initialize Editia Core
initializeEditiaCore({
  clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
  environment: 'production',
});

// Public routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected routes
app.get('/api/user/profile', authenticateUser, (req, res) => {
  res.json({ user: req.user });
});

// Pro-only routes
app.get('/api/pro/analytics', requireProAccess, (req, res) => {
  res.json({ analytics: 'pro-features' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Feature Access Check

```typescript
import { verifyUser, hasProAccess } from '@editia/core';

async function checkFeatureAccess(authHeader: string, featureId: string) {
  // Verify user
  const { user, errorResponse } = await verifyUser(authHeader);

  if (errorResponse) {
    throw new Error(`Authentication failed: ${errorResponse.error}`);
  }

  // Check Pro access for premium features
  if (featureId === 'premium-analytics') {
    const hasPro = await hasProAccess(authHeader);
    if (!hasPro) {
      throw new Error('Pro subscription required');
    }
  }

  return { user, hasAccess: true };
}
```

## 🔄 Migration Guide

### From Individual Services

If you're currently using separate authentication services in your applications:

1. **Install the package**: `npm install @editia/core`
2. **Initialize**: Call `initializeEditiaCore()` in your app startup
3. **Replace middleware**: Use `authenticateUser` instead of custom auth middleware
4. **Update imports**: Import types and utilities from `@editia/core`
5. **Test thoroughly**: Ensure all authentication flows work correctly

### From Server-Primary/Server-Analyzer

The package consolidates the best patterns from both servers:

- **Server-Primary patterns**: Comprehensive error handling and logging
- **Server-Analyzer patterns**: Clean middleware structure and type safety

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/editia/core.git
cd editia-core

# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Run linting
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@editia.app
- 🐛 Issues: [GitHub Issues](https://github.com/editia/core/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/editia/core/wiki)

## 🔮 Roadmap

### Phase 1 (Current) ✅

- [x] Unified authentication service
- [x] Express middleware
- [x] Type definitions
- [x] Basic testing

### Phase 2 (Next)

- [ ] Feature flags service
- [ ] Usage tracking service
- [ ] Subscription management
- [ ] Database type generation

### Phase 3 (Future)

- [ ] RevenueCat integration
- [ ] Advanced analytics
- [ ] Performance monitoring
- [ ] Plugin system

---

Made with ❤️ by the Editia Team
