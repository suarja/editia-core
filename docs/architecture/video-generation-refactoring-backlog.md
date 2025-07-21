# Video Generation Types Integration - Refactoring Backlog

**Project Status:** 🔄 Planning Phase  
**Priority:** High  
**Estimated Duration:** 3-4 weeks (80/20 approach - pre-release)  
**Last Updated:** 2025-01-21  

## 📋 Project Overview

This document outlines the streamlined refactoring plan to integrate video generation types into the editia-core package, eliminating code duplication between mobile app and server-primary while establishing type-safe communication patterns. 

**Pre-Release Approach:** Since the app hasn't been released yet, we can implement changes efficiently without migration strategies, rollback plans, or complex deployment coordination.

### 🎯 Primary Objectives

- [ ] **Type Consolidation**: Move shared video generation types to editia-core package
- [ ] **Type-Safe APIs**: Implement tRPC-inspired typed request/response interfaces  
- [ ] **Shared Validation**: Create unified Zod schemas for consistent data validation
- [ ] **Video Template Service**: Unify video template operations in a single service
- [ ] **Template Validation**: Add caption checking and video duration validation
- [ ] **Video Status Polling**: Implement custom hook for video request status updates
- [ ] **Core Testing**: Essential tests for shared types and critical flows

## 📊 Current State Analysis

### ✅ Existing Strengths
- **EditIA-Core v1.8.3**: Robust authentication and monetization infrastructure
- **Mobile App**: Sophisticated video generation UI with React Native/Expo
- **Server-Primary**: Comprehensive video generation pipeline with Creatomate integration
- **Testing Foundation**: Good test coverage in individual services

### ❌ Current Issues
- **Type Duplication**: `CaptionConfiguration`, `EditorialProfile`, `VideoGenerationRequest` defined in both mobile and server
- **Validation Inconsistency**: Different validation approaches between services
- **Missing Implementation**: Mobile `VideoValidationService` expected by tests but not implemented
- **Communication Gaps**: No type-safe API patterns for request/response flow
- **Video Template Operations**: Scattered template logic needs consolidation
- **Missing Template Validation**: No caption enabling check or video duration validation
- **No Status Polling**: Video details page lacks real-time status updates

## 🗂️ Files Requiring Modification

### EditIA-Core Package
- [ ] `src/video/types.ts` *(new)* - Consolidated video generation interfaces
- [ ] `src/video/validation.ts` *(new)* - Shared Zod validation schemas  
- [ ] `src/video/constants.ts` *(new)* - Shared constants and enums
- [ ] `src/video/index.ts` *(new)* - Export barrel for video types
- [ ] `src/index.ts` - Add video types to main exports
- [ ] `package.json` - Version bump to v1.9.0

### Mobile App
- [ ] `lib/types/video.types.ts` - Remove duplicates, import from editia-core
- [ ] `app/hooks/useVideoRequest.ts` - Update type imports and validation
- [ ] `app/(drawer)/script-video-settings.tsx` - Update type references
- [ ] `lib/services/video/VideoValidationService.ts` *(new)* - Implement missing service
- [ ] `__tests__/services/video/validation.test.ts` - Update imports and tests
- [ ] `package.json` - Update editia-core dependency to v1.9.0

### Server-Primary  
- [ ] `src/types/video.ts` - Remove duplicates, import from editia-core
- [ ] `src/services/video/VideoValidationService.ts` - Refactor to use shared schemas
- [ ] `src/controllers/video/` - Update type imports and validation logic
- [ ] `src/routes/video/` - Implement typed route handlers
- [ ] `package.json` - Update editia-core dependency to v1.9.0

### Documentation & Testing
- [ ] `docs/architecture/video-generation.md` *(new)* - Architecture documentation
- [ ] `docs/migration/video-types-refactoring.md` *(new)* - Migration guide
- [ ] `__tests__/video/` *(new)* - Test directory in editia-core
- [ ] Integration tests across mobile and server-primary

## 📅 Implementation Roadmap (80/20 Approach)

### 🚀 Sprint 1: Core Types and Branching (Week 1)
**Priority:** Critical | **Status:** 🔄 Ready to Start

#### Setup Tasks
- [ ] **Branch Creation** - Create feature branches in mobile and server-primary repos
  - [ ] `git checkout -b feature/video-types-integration` in mobile repo  
  - [ ] `git checkout -b feature/video-types-integration` in server-primary repo
  - [ ] No complex versioning needed - direct implementation

#### Core Implementation
- [ ] **EditIA-Core Video Types** - Create shared type definitions
  - [ ] Create `editia-core/src/video/types.ts` with consolidated interfaces
  - [ ] Create `editia-core/src/video/validation.ts` with Zod schemas
  - [ ] Create `editia-core/src/video/constants.ts` with LANGUAGES and enums
  - [ ] Update `editia-core/src/index.ts` exports
  - [ ] Version bump to v1.9.0 and publish

#### Video Template Service
- [ ] **Unified Template Service** - Consolidate video template operations
  - [ ] Create centralized service for all template operations in server-primary
  - [ ] **Caption Validation**: Check if captions are enabled and remove from template if disabled
  - [ ] **Duration Validation**: Verify each video duration >= text duration using `script_length * 0.8` formula

### 📱 Sprint 2: Mobile App Migration (Week 2)
**Priority:** High | **Status:** ⏳ Pending

#### Mobile Integration Tasks
- [ ] **Dependency Update** - Update `package.json` to editia-core v1.9.0
- [ ] **Type Migration** - Replace local types with editia-core imports
  - [ ] Update `lib/types/video.types.ts` to import from editia-core
  - [ ] Update `app/hooks/useVideoRequest.ts` type references
  - [ ] Update `script-video-settings.tsx` and related components
- [ ] **Missing Service Implementation** - Create `VideoValidationService` in mobile
  - [ ] Implement client-side validation using shared Zod schemas
  - [ ] Update existing tests to pass
- [ ] **Video Status Polling Hook** - Create custom hook for real-time status updates
  - [ ] Create `useVideoStatusPolling` hook for video details page
  - [ ] Implement periodic polling of video-request status
  - [ ] Handle loading states and error conditions

### 🖥️ Sprint 3: Server-Primary Migration (Week 3)
**Priority:** High | **Status:** ⏳ Pending

#### Server Integration Tasks  
- [ ] **Dependency Update** - Update `package.json` to editia-core v1.9.0
- [ ] **Type Migration** - Replace server types with editia-core imports
  - [ ] Update `src/types/video.ts` to import from editia-core
  - [ ] Update controllers and route handlers
  - [ ] Refactor `VideoValidationService` to use shared schemas
- [ ] **Template Service Enhancement** - Implement template validations
  - [ ] Add caption-enabled check before template generation
  - [ ] Implement video duration validation with conservative formula
  - [ ] Add proper error handling for validation failures

### ✅ Sprint 4: Testing and Polish (Week 4)
**Priority:** Medium | **Status:** ⏳ Pending

#### Essential Testing
- [ ] **Core Unit Tests** - Test shared types and validation schemas in editia-core
- [ ] **Integration Tests** - Test mobile-to-server communication with new types
- [ ] **Template Service Tests** - Test caption and duration validation logic
- [ ] **Status Polling Tests** - Test video status polling hook functionality
- [ ] **No Creatomate in Tests** - Mock Creatomate API calls (expensive and webhook-based)

#### Quality Assurance  
- [ ] **Type Safety Verification** - Ensure full TypeScript coverage for video APIs
- [ ] **Error Handling** - Test error scenarios across the type-safe communication
- [ ] **Performance Check** - Verify no significant performance impact from new validation

## ⚠️ Risk Management (Simplified for Pre-Release)

### Critical Watch Points
- [ ] **Circular Dependencies** - Monitor import structure between editia-core and consuming services
- [ ] **Performance Impact** - Monitor bundle size increases in mobile app
- [ ] **Monetization Integrity** - Ensure RevenueCat integration remains functional
- [ ] **Database Compatibility** - Validate branded types work with existing Supabase queries

### Simplified Approach
- **No Migration Needed** - App not released yet, direct dependency updates
- **No Rollback Plans** - Create branches, merge when stable
- **Simple Deployment** - Update dependencies and deploy directly

## 🚀 Future Improvements (Post-Launch)

### Advanced Features (Later)
- [ ] **Automatic Code Generation** - Generate API clients from shared schemas
- [ ] **Runtime Validation Middleware** - Automatic request/response validation  
- [ ] **Pattern Application** - Apply learned patterns to TikTok analysis feature
- [ ] **Performance Monitoring** - Add structured logging for type validation

## 📊 Success Metrics (80/20 Focus)

### Core Success Criteria
- [ ] **Type Safety**: 100% type coverage for video generation APIs
- [ ] **Code Reduction**: >80% reduction in duplicated type definitions  
- [ ] **Template Validation**: Caption and duration checks working correctly
- [ ] **Status Polling**: Video details page shows real-time status updates
- [ ] **Build Performance**: <5% increase in build times across services

## 🎯 Sprint Summary

**4-Week Implementation Plan:**
- **Week 1**: Core types in editia-core + Template service with validations
- **Week 2**: Mobile app migration + Video status polling hook  
- **Week 3**: Server-primary migration + Template validation implementation
- **Week 4**: Essential testing + Quality assurance

**Key Features Added:**
- Unified video template operations service
- Caption enabling validation in templates
- Video duration validation using `script_length * 0.8` formula
- Custom hook for video request status polling
- Type-safe communication between mobile and server

---

*This document follows the 80/20 principle - focusing on the 20% of features that deliver 80% of the value for a pre-release application.*