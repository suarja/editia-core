/**
 * Editia Core - Main Export
 * 
 * This is the main entry point for the Editia Core package.
 * It provides a unified interface for authentication, monetization, and feature management.
 */

// ============================================================================
// CORE EXPORTS
// ============================================================================

// Types and utilities
export * from './types';

// Video generation types and validation
export * from './video';

// React Native hooks
export * from './hooks';

// Middleware
export * from './middleware';


// ============================================================================
// SERVICES
// ============================================================================

// Authentication services
export * from './services/auth';

// Monetization services
export * from './services/monetization';

// ============================================================================
// VERSION INFO
// ============================================================================

export const VERSION = '2.0.3';
export const PACKAGE_NAME = 'editia-core'; 