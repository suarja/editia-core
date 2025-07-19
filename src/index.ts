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

// React Native hooks
export * from './hooks';

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

export const VERSION = '1.1.0';
export const PACKAGE_NAME = 'editia-core'; 