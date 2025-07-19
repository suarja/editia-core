/**
 * Vitest test setup file for Editia Core
 * Configures test environment and global test utilities
 */

import { vi, beforeAll, afterAll } from 'vitest';

// Set test environment
process.env['NODE_ENV'] = 'test';

// Mock console methods to reduce noise in tests
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
};

// Suppress console output during tests unless explicitly needed
beforeAll(() => {
  console.log = vi.fn();
  console.info = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
  console.debug = vi.fn();
});

// Restore console methods after tests
afterAll(() => {
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
});

// Global test utilities
(global as any).testUtils = {
  // Mock Clerk JWT token for testing
  createMockJWT: (userId: string = 'test-user-id'): string => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({
      sub: userId,
      aud: 'test-audience',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      iat: Math.floor(Date.now() / 1000),
      iss: 'https://clerk.test',
    })).toString('base64');
    const signature = 'test-signature';
    
    return `${header}.${payload}.${signature}`;
  },

  // Mock auth header
  createAuthHeader: (token?: string): string => {
    return `Bearer ${token || (global as any).testUtils.createMockJWT()}`;
  },

  // Mock database user
  createMockDatabaseUser: (overrides: Partial<any> = {}) => {
    return {
      id: 'test-db-user-id',
      email: 'test@example.com',
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      role: 'user',
      clerk_user_id: 'test-clerk-user-id',
      subscription_tier: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  },

  // Mock Clerk user
  createMockClerkUser: (overrides: Partial<any> = {}) => {
    return {
      id: 'test-clerk-user-id',
      emailAddresses: [
        {
          emailAddress: 'test@example.com',
          id: 'test-email-id',
          linkedTo: [],
          object: 'email_address',
          verification: {
            status: 'verified',
            strategy: 'email_code',
          },
        },
      ],
      firstName: 'Test',
      lastName: 'User',
      imageUrl: 'https://example.com/avatar.jpg',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      ...overrides,
    };
  },
};

// Extend global types for test utilities
declare global {
  var testUtils: {
    createMockJWT: (userId?: string) => string;
    createAuthHeader: (token?: string) => string;
    createMockDatabaseUser: (overrides?: Partial<any>) => any;
    createMockClerkUser: (overrides?: Partial<any>) => any;
  };
}

export {}; 