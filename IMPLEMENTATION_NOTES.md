# Implementation Notes - @editia/core Package

## Overview

This document outlines the implementation decisions and changes made during the development of the `@editia/core` package.

## Key Decisions

### 1. Logging Strategy

**Decision**: Removed logging system from the package
**Rationale**:

- User requested no logging in the package
- Each application (mobile, server) can implement its own logging strategy
- Server applications use Winston with BetterStack
- Mobile applications have different logging needs
- Reduces package complexity and dependencies

**Impact**:

- Removed `src/utils/logging.ts`
- Removed all logger references from services and middleware
- Simplified error handling to use console.log/console.error for basic output
- Removed `logLevel` from `AuthConfig` interface

### 2. Testing Framework

**Decision**: Replaced Jest with Vitest
**Rationale**:

- User preference for Vitest
- Vitest is faster and more modern
- Better TypeScript support
- Compatible with Vite ecosystem

**Changes**:

- Replaced `jest.config.js` with `vitest.config.ts`
- Updated test setup to use Vitest imports (`vi` instead of `jest`)
- Updated package.json scripts and dependencies
- All tests now pass with Vitest

### 3. Authentication Service Design

**Decision**: Static class pattern for ClerkAuthService
**Rationale**:

- Follows patterns from existing server applications
- Single initialization point
- Consistent across all applications
- Easy to mock in tests

**Features**:

- JWT verification with Clerk
- Database user lookup with Supabase
- Pro subscription checking (placeholder for RevenueCat)
- User deletion functionality
- Comprehensive error handling

### 4. Middleware Architecture

**Decision**: Express middleware with type safety
**Rationale**:

- Consistent with server applications
- Type-safe request augmentation
- Flexible authentication options (required, optional, Pro-only)

**Middleware Types**:

- `authenticateUser`: Required authentication
- `requireProAccess`: Pro subscription required
- `optionalAuth`: Optional authentication
- `createAuthMiddleware`: Factory function for custom options

## File Structure

```
editia-core/
├── src/
│   ├── types/           # TypeScript type definitions
│   ├── services/        # Business logic services
│   ├── middleware/      # Express middleware
│   └── index.ts         # Main entry point
├── tests/
│   ├── setup.ts         # Test environment setup
│   └── unit/            # Unit tests
├── vitest.config.ts     # Vitest configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Package configuration
```

## Testing Strategy

- **Unit Tests**: Comprehensive coverage of all public methods
- **Mock Strategy**: Mock external dependencies (Clerk, Supabase)
- **Test Utilities**: Global test utilities for common mocks
- **Coverage**: 80% threshold for all metrics

## Build Configuration

- **TypeScript**: Strict mode with declaration generation
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **TypeDoc**: API documentation generation

## Dependencies

### Production Dependencies

- `@clerk/backend`: JWT verification and user management
- `@supabase/supabase-js`: Database operations

### Development Dependencies

- `vitest`: Testing framework
- `typescript`: Type checking and compilation
- `eslint`: Code linting
- `prettier`: Code formatting
- `typedoc`: Documentation generation

## Future Considerations

### Phase 2 Features

- Feature flags service
- Usage tracking service
- Subscription management

### Phase 3 Features

- RevenueCat integration
- Advanced analytics
- Performance monitoring

## Migration Notes

### From Individual Services

1. Install package: `npm install @editia/core`
2. Initialize: Call `initializeEditiaCore()`
3. Replace middleware: Use provided Express middleware
4. Update imports: Import from `@editia/core`

### Breaking Changes

- No logging system (applications must implement their own)
- Static service pattern (no instance creation)
- TypeScript strict mode requirements

## Performance Considerations

- Static service initialization (no runtime overhead)
- Minimal dependencies (reduced bundle size)
- Efficient JWT verification
- Database connection pooling via Supabase client

## Security Considerations

- JWT verification with Clerk
- Database queries with RLS policies
- No sensitive data in logs
- Type-safe request handling
- Comprehensive error handling without information leakage
