/**
 * Video generation types and utilities
 * Barrel export file for all video-related functionality
 */

// Constants and enums
export * from './constants';

// Type definitions  
export * from './types';

// Validation schemas and utilities
export * from './validation';

// Video template service
export * from './template-service';

// Re-export commonly used types for convenience
export type {
  VideoId,
  ScriptId,
  UserId,
  GenerationJobId,
  VideoType,
  CaptionConfiguration,
  VideoEditorialProfile,
  VideoGenerationRequest,
  VideoGenerationResult,
  VideoRequest,
  ApiResponse,
  VideoStatusResponse,
} from './types';

export {
  VideoRequestStatus,
  LANGUAGES,
  CAPTION_PLACEMENTS,
  TRANSCRIPT_EFFECTS,
} from './constants';

export {
  CaptionConfigurationSchema,
  VideoEditorialProfileSchema,
  VideoGenerationRequestSchema,
  validateVideoDuration,
  validateCaptionConfig,
  validateVideoEditorialProfile,
  validateVideoGenerationRequest,
  isValidHexColor,
  isValidVideo,
} from './validation';

export {
  VideoTemplateService,
} from './template-service';