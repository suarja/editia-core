# Editia Core

A TypeScript package for unified authentication, monetization, and database management for all Editia applications.

## 🚀 Installation

```bash
npm install editia-core
```

## 📦 Features

-   **Clerk + Supabase Authentication:** JWT verification and user management.
-   **Express Middleware:** Protect your routes with authentication and monetization middleware.
-   **TypeScript:** Full type safety and autocompletion.
-   **No Logging:** Delegates logging to the main application for greater flexibility.

## 🔧 Initialization

To use the package, you must first initialize it with your environment variables.

```typescript
import { initializeEditiaCore } from 'editia-core';

// Initialize the package with your environment variables
initializeEditiaCore({
  clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use the service role key for backend operations
  environment: process.env.NODE_ENV || 'development',
});
```

## 🔐 Authentication

### Using the Service Directly

You can use the `ClerkAuthService` directly in your route handlers to verify users.

```typescript
import { ClerkAuthService } from 'editia-core';

// In an Express endpoint
app.get('/api/user-voices', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { user, clerkUser, errorResponse } =
      await ClerkAuthService.verifyUser(authHeader);

    if (errorResponse) {
      return res.status(errorResponse.status).json(errorResponse);
    }

    // user contains the user data from Supabase
    // clerkUser contains the user data from Clerk

    res.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        clerkId: clerkUser.id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});
```

### Using the Middleware

The package provides a set of Express middleware functions to simplify route protection.

```typescript
import { authenticateUser } from 'editia-core';

// Protect a route with the middleware
app.get('/api/protected', authenticateUser, (req, res) => {
  // req.user contains the authenticated user
  res.json({
    success: true,
    user: {
      id: req.user?.id,
      email: req.user?.email,
    },
  });
});
```

## 💰 Monetization

The package includes a powerful monetization system that allows you to protect routes based on user subscriptions and usage limits.

### Using the Monetization Middleware

```typescript
import {
  authenticateUser,
  videoGenerationMiddleware,
  createUsageIncrementMiddleware,
} from 'editia-core';

// Protect the video generation route
app.post(
  '/api/videos/generate',
  authenticateUser, // 1. Authenticate the user
  videoGenerationMiddleware, // 2. Check monetization
  createUsageIncrementMiddleware(), // 3. Increment usage on success
  async (req, res) => {
    // Your video generation logic here
    res.json({ success: true, videoUrl: '...' });
  }
);
```

For more details on the monetization system, see the [Backend Monetization System documentation](./docs/monetization/backend-monetization-system.md).

## 📋 API Reference

### `initializeEditiaCore(config: AuthConfig)`

Initializes the package with your environment variables. This must be called before any other methods.

**Parameters:**

-   `config` (`AuthConfig`): An object containing your Clerk and Supabase credentials.

### `ClerkAuthService`

#### `verifyUser(authHeader?: string)`

Verifies a Clerk JWT and returns the corresponding user information from both Clerk and Supabase.

**Parameters:**

-   `authHeader` (`string`, optional): The `Authorization` header (e.g., "Bearer <token>").

**Returns:**

```typescript
{
  user: DatabaseUser | null; // The user from Supabase
  clerkUser: ClerkUser | null; // The user from Clerk
  errorResponse: AuthErrorResponse | null; // An error object if verification fails
}
```

#### `getDatabaseUserId(authHeader?: string)`

Retrieves only the user ID from the database.

**Returns:** `string | null`

### Middleware

#### `authenticateUser`

An Express middleware that protects routes by requiring a valid Clerk JWT.

**Usage:**

```typescript
app.get('/protected', authenticateUser, (req, res) => {
  // req.user contains the authenticated user
});
```

#### `videoGenerationMiddleware`

An Express middleware that protects video generation routes based on the user's subscription plan and usage limits.

#### `createUsageIncrementMiddleware()`

An Express middleware that increments a user's usage for a specific action after a successful operation.

### Types

```typescript
interface DatabaseUser {
  id: string;
  email: string;
  full_name?: string;
  clerk_user_id: string;
  created_at: string;
  updated_at: string;
}

interface AuthErrorResponse {
  success: false;
  error: string;
  status: number;
}

interface AuthenticatedRequest extends Request {
  user?: DatabaseUser;
}
```

## 🧪 Tests

The package includes a comprehensive test suite using Vitest.

```bash
npm test
```

## 📝 Logging

**Important:** This package does not handle logging. It is the responsibility of the consuming application to implement a logging solution.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for more details.