/**
 * Authentication types for Editia Core
 * Based on analysis of server-primary and server-analyzer patterns
 */

import { User as ClerkUser } from '@clerk/backend';

/**
 * Database user interface
 * Represents a user in the Supabase database
 */
export interface DatabaseUser {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  clerk_user_id: string;
  subscription_tier?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Authentication result interface
 * Returned by authentication services
 */
export interface AuthResult {
  user: DatabaseUser | null;
  clerkUser: ClerkUser | null;
  errorResponse: AuthErrorResponse | null;
}

/**
 * Authentication error response
 * Standardized error format for auth failures
 */
export interface AuthErrorResponse {
  success: false;
  error: string;
  status: number;
  hint?: string | undefined;
}

/**
 * Extended Express Request interface
 * Adds user property to Express Request
 */
export interface AuthenticatedRequest {
  user?: DatabaseUser;
}

/**
 * Authentication configuration
 * Configuration options for authentication services
 */
export interface AuthConfig {
  clerkSecretKey: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  environment?: 'development' | 'production' | 'test';
}

/**
 * User management operations
 */
export interface UserManagementOperations {
  createUser: (clerkUser: ClerkUser) => Promise<DatabaseUser>;
  updateUser: (userId: string, updates: Partial<DatabaseUser>) => Promise<DatabaseUser>;
  deleteUser: (userId: string) => Promise<boolean>;
  getUserById: (userId: string) => Promise<DatabaseUser | null>;
  getUserByClerkId: (clerkUserId: string) => Promise<DatabaseUser | null>;
}

/**
 * Authentication service interface
 * Defines the contract for authentication services
 */
export interface AuthServiceInterface {
  verifyUser: (authHeader?: string | null) => Promise<AuthResult>;
  getDatabaseUserId: (authHeader?: string | null) => Promise<string | null>;
  verifyProUser?: (authHeader?: string | null) => Promise<AuthResult>;
  hasProAccess?: (authHeader?: string | null) => Promise<boolean>;
}

/**
 * JWT token verification result
 * Result from Clerk JWT verification
 */
export interface JWTVerificationResult {
  sub: string; // User ID
  aud: string; // Audience
  exp: number; // Expiration
  iat: number; // Issued at
  iss: string; // Issuer
  [key: string]: unknown; // Additional claims
} 