# EditIA Core - Source Code

This directory contains the core implementation of the EditIA shared package, providing unified authentication, monetization, and database management across all EditIA applications.

## Architecture Overview

EditIA Core follows a modular, service-oriented architecture with clean separation of concerns:

```
src/
├── index.ts                 # Main package exports
├── hooks/                   # React hooks for client-side usage
├── middleware/              # Express middleware for server-side usage
├── services/                # Core business logic services
├── types/                   # Shared TypeScript type definitions
└── utils/                   # Utility functions and helpers
```

## Key Components

### Authentication (`services/auth/`)
- **ClerkAuthService**: JWT verification and user management
- **Clerk + Supabase Integration**: Seamless authentication flow
- **Branded Types**: `UserId`, `ClerkUserId` for type safety

### Monetization (`services/monetization/`)
- **MonetizationService**: Feature access and usage tracking
- **Plan Management**: Free, Creator, Pro tier handling
- **Usage Limits**: Automatic enforcement and tracking

### Middleware (`middleware/`)
- **authenticateUser**: Express middleware for route protection
- **videoGenerationMiddleware**: Feature-specific access control
- **createUsageIncrementMiddleware**: Post-action usage tracking

### Types (`types/`)
- **Database Types**: Supabase-generated with manual overrides
- **Feature Flags**: Type-safe feature flag definitions
- **Usage Tracking**: Comprehensive usage monitoring types

## Usage Examples

### Server-side (Express)
```typescript
import { initializeEditiaCore, authenticateUser, videoGenerationMiddleware } from 'editia-core';

// Initialize the core package
initializeEditiaCore({
  clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  environment: process.env.NODE_ENV || 'development',
});

// Protect routes with authentication and monetization
app.post('/api/videos/generate',
  authenticateUser,
  videoGenerationMiddleware,
  createUsageIncrementMiddleware(),
  async (req, res) => {
    // Your video generation logic here
  }
);
```

### Client-side (React)
```typescript
import { useEditiaMonetization } from 'editia-core';

function VideoGenerationComponent() {
  const { canGenerateVideo, usage, plan } = useEditiaMonetization();
  
  if (!canGenerateVideo) {
    return <UpgradePrompt plan={plan} usage={usage} />;
  }
  
  return <VideoGenerationForm />;
}
```

## Development Patterns

### Type Safety First
All domain entities use branded types for improved type safety:
```typescript
type UserId = Brand<string, 'UserId'>;
type VideoId = Brand<string, 'VideoId'>;
```

### Testing Strategy
- **Unit Tests**: Service logic testing with Vitest
- **Integration Tests**: Middleware and API integration
- **Type Tests**: Compile-time type safety validation

### Error Handling
Consistent error response format across all services:
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  status: number;
}
```

## Change History

See [CHANGES.md](../CHANGES.md) for detailed change tracking and architectural evolution.

## Related Documentation

- [Package README](../README.md) - Installation and basic usage
- [Monetization System](../docs/monetization/backend-monetization-system.md) - Detailed monetization docs
- [Migration Guide](../docs/migration-guide.md) - Upgrading between versions
- [Claude Code Guidelines](../docs/claude-code-guidelines-jason-suarez.md) - Development standards