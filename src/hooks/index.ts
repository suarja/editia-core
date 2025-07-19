/**
 * Editia Core Hooks - Main Export
 * 
 * This file provides React Native hooks for the Editia Core package.
 */

// ============================================================================
// MONETIZATION HOOKS
// ============================================================================

export {
  useEditiaMonetization,
  type EditiaMonetizationConfig,
  type EditiaMonetizationState,
  type EditiaMonetizationActions,
  type UseEditiaMonetizationReturn,
} from './useEditiaMonetization';

// ============================================================================
// FUTURE HOOKS (To be implemented)
// ============================================================================

// Authentication hooks
// export { useEditiaAuth } from './useEditiaAuth';

// Feature access hooks
// export { useEditiaFeatureAccess } from './useEditiaFeatureAccess';

// Usage tracking hooks
// export { useEditiaUsage } from './useEditiaUsage';

// ============================================================================
// RE-EXPORT ALL HOOKS FOR CONVENIENCE
// ============================================================================

export * from './useEditiaMonetization'; 