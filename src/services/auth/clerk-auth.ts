/**
 * Unified Clerk Authentication Service
 * Based on analysis of server-primary and server-analyzer patterns
 */

import { createClerkClient, verifyToken } from '@clerk/backend';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AuthResult,
  DatabaseUser,
  AuthConfig,
  JWTVerificationResult,
} from '../../types/auth';

// Re-export types for external use
export type { AuthResult, DatabaseUser, AuthConfig, JWTVerificationResult };
import { Database } from '../../types/database';


/**
 * Unified Clerk Authentication Service
 * Combines the best patterns from server-primary and server-analyzer
 */
export class ClerkAuthService {
  private static clerkClient: ReturnType<typeof createClerkClient>;
  private static supabaseClient: SupabaseClient<Database>;

  private static config: AuthConfig;

  /**
   * Initialize the authentication service
   * Must be called before using any authentication methods
   */
  public static initialize(config: AuthConfig): void {
    this.config = config;

    
    // Initialize Clerk client
    this.clerkClient = createClerkClient({
      secretKey: config.clerkSecretKey,
    });

    // Initialize Supabase client with service role key to bypass RLS
    this.supabaseClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });


  }

  /**
   * Verify user from a Clerk JWT token and return both Clerk user and database user
   * @param authHeader The Authorization header value containing Clerk JWT
   * @returns Object containing Clerk user, database user, or error response
   */
  public static async verifyUser(authHeader?: string | null): Promise<AuthResult> {

    // Check if service is initialized
    if (!this.isInitialized()) {
      return this.createErrorResponse('Authentication service not initialized', 500);
    }

    // Check if auth header exists
    if (!authHeader) {
      return this.createErrorResponse('Missing authorization header', 401, 'Include Authorization: Bearer <clerk-jwt-token> in your request');
    }

    // Extract token from header
    const token = authHeader.replace('Bearer ', '');

    // Basic JWT format validation
    const jwtParts = token.split('.');
    if (jwtParts.length !== 3) {
      return this.createErrorResponse(
        'Invalid JWT format - token should have 3 parts separated by dots',
        401
      );
    }

    try {
      // Verify JWT token with Clerk
      const verifiedToken = await verifyToken(token, {
        secretKey: this.config.clerkSecretKey,
      }) as unknown as JWTVerificationResult;

      if (!verifiedToken || !verifiedToken.sub) {
        return this.createErrorResponse('Invalid authentication token', 401);
      }

      // Get Clerk user details
      const clerkUser = await this.clerkClient.users.getUser(verifiedToken.sub);

      if (!clerkUser) {
        return this.createErrorResponse('Clerk user not found', 401);
      }

      // Get database user using Clerk user ID
      const { data: databaseUser, error: dbError } = await this.supabaseClient
        .from('users')
        .select('*')
        .eq('clerk_user_id', clerkUser.id)
        .single();

      if (dbError || !databaseUser) {
        console.warn(`⚠️ [ClerkAuthService] Database user not found for Clerk user: ${clerkUser.id}`);
        console.warn(`⚠️ [ClerkAuthService] User should be auto-created via Clerk webhook (clerk-webhook-handler).`);
        console.warn(`⚠️ [ClerkAuthService] If webhook failed, check Supabase Edge Function logs.`);

        return {
          user: null,
          clerkUser: clerkUser,
          errorResponse: {
            success: false,
            error: 'Database user not found. Please complete onboarding.',
            status: 404,
            hint: 'User exists in Clerk but not in database. The Clerk webhook should have created this user automatically. Check Edge Function logs if this persists.',
          },
        };
      }

      // Return both Clerk user and database user
      return {
        user: databaseUser as DatabaseUser,
        clerkUser: clerkUser,
        errorResponse: null,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return this.createErrorResponse(
        `Authentication service error: ${errorMessage}`,
        500
      );
    }
  }

  /**
   * Helper method to get just the database user ID from a Clerk token
   * @param authHeader The Authorization header value containing Clerk JWT
   * @returns Database user ID or null
   */
  public static async getDatabaseUserId(authHeader?: string | null): Promise<string | null> {
    const { user } = await this.verifyUser(authHeader);
    return user?.id || null;
  }

  /**
   * Check if user has Pro subscription (required for certain features)
   * @param authHeader The Authorization header value containing Clerk JWT
   * @returns True if user has Pro access
   */
  public static async hasProAccess(authHeader?: string | null): Promise<boolean> {
    const { user, errorResponse } = await this.verifyUser(authHeader);

    // If user verification failed, they don't have access
    if (errorResponse || !user) {
      return false;
    }

    try {
      // Check user's current plan from user_usage table
      const { data: userUsage, error } = await this.supabaseClient
        .from('user_usage')
        .select('current_plan_id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('❌ [ClerkAuthService] Error fetching user usage:', error);
        return false;
      }

      // User has Pro access if their plan is 'pro' or 'creator'
      const isPro = userUsage?.current_plan_id === 'pro' ||
                    userUsage?.current_plan_id === 'creator';

      console.log(`✅ [ClerkAuthService] User ${user.id} Pro access: ${isPro} (plan: ${userUsage?.current_plan_id})`);

      return isPro;
    } catch (error) {
      console.error('❌ [ClerkAuthService] Exception checking Pro access:', error);
      return false;
    }
  }

  /**
   * Verify user and check Pro access in one call
   * @param authHeader The Authorization header value containing Clerk JWT
   * @returns AuthResult with Pro access verification
   */
  public static async verifyProUser(authHeader?: string | null): Promise<AuthResult> {
    const result = await this.verifyUser(authHeader);
    
    if (result.errorResponse) {
      return result;
    }

    // Check Pro subscription
    const hasProAccess = await this.hasProAccess(authHeader);
    
    if (!hasProAccess) {
      return {
        user: null,
        clerkUser: null,
        errorResponse: {
          success: false,
          error: 'Pro subscription required for this feature',
          status: 403,
          hint: 'Upgrade to Pro plan to access this feature',
        },
      };
    }

    return result;
  }

  /**
   * Delete user from both Clerk and database
   * @param authHeader The Authorization header value containing Clerk JWT
   * @returns Success status and error if any
   */
  public static async deleteUser(authHeader?: string | null): Promise<{ success: boolean; error?: string }> {
    try {
      const { user, clerkUser } = await this.verifyUser(authHeader);
      
      if (!user || !clerkUser) {
        return { success: false, error: 'User not found' };
      }

      // Delete from database first
      const { error: dbError } = await this.supabaseClient
        .from('users')
        .delete()
        .eq('clerk_user_id', clerkUser.id);

      if (dbError) {
        return { success: false, error: 'Failed to delete user from database' };
      }

      // Delete from Clerk
      await this.clerkClient.users.deleteUser(clerkUser.id);

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to delete user: ${errorMessage}` };
    }
  }

  /**
   * Check if the service is properly initialized
   * @returns True if initialized, false otherwise
   */
  private static isInitialized(): boolean {
    return !!(this.clerkClient && this.supabaseClient && this.config);
  }

  /**
   * Create a standardized error response
   * @param error Error message
   * @param status HTTP status code
   * @param hint Optional hint for debugging
   * @returns AuthErrorResponse
   */
  private static createErrorResponse(error: string, status: number, hint?: string): AuthResult {
    return {
      user: null,
      clerkUser: null,
      errorResponse: {
        success: false,
        error,
        status,
        hint,
      },
    };
  }
} 