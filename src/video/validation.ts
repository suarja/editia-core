/**
 * Shared Zod validation schemas for video generation
 * Replaces duplicated validation logic across mobile and server-primary
 */

import { z } from 'zod';
import { 
  LANGUAGES, 
  CAPTION_PLACEMENTS, 
  TRANSCRIPT_EFFECTS, 
  VideoRequestStatus,
  VIDEO_DURATION_MULTIPLIER 
} from './constants';

// Utility schema for branded types
export const VideoIdSchema = z.string().brand<'VideoId'>();
export const ScriptIdSchema = z.string().brand<'ScriptId'>();
export const UserIdSchema = z.string().brand<'UserId'>();
export const GenerationJobIdSchema = z.string().brand<'GenerationJobId'>();

// Hex color validation
export const HexColorSchema = z.string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
  .brand<'HexColor'>();

// Caption configuration schema (unified from mobile and server)
export const CaptionConfigurationSchema = z.object({
  enabled: z.boolean(),
  presetId: z.string().optional(),
  placement: z.enum(CAPTION_PLACEMENTS),
  transcriptColor: HexColorSchema.optional(),
  transcriptEffect: z.enum(TRANSCRIPT_EFFECTS).optional(),
});

// Editorial profile schema for video generation (unified from mobile and server) 
export const VideoEditorialProfileSchema = z.object({
  persona_description: z.string().min(1, 'Persona description is required'),
  tone_of_voice: z.string().min(1, 'Tone of voice is required'),
  audience: z.string().min(1, 'Audience is required'),
  style_notes: z.string().min(1, 'Style notes are required'),
  examples: z.string().optional(),
});

// Video type schema (base validation)
export const VideoTypeSchema = z.object({
  id: VideoIdSchema,
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  upload_url: z.string().url('Must be a valid URL'),
  tags: z.array(z.string()),
  user_id: UserIdSchema,
  created_at: z.string(),
  duration_seconds: z.number().nullable(),
  analysis_status: z.nativeEnum(VideoRequestStatus).optional(),
  analysis_data: z.unknown().optional(),
});

// Video generation request schema
export const VideoGenerationRequestSchema = z.object({
  scriptId: ScriptIdSchema.optional(),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  selectedVideoIds: z.array(VideoIdSchema).min(1, 'At least one video must be selected'),
  captionConfig: CaptionConfigurationSchema,
  editorialProfile: VideoEditorialProfileSchema,
  outputLanguage: z.enum(Object.keys(LANGUAGES) as [keyof typeof LANGUAGES, ...Array<keyof typeof LANGUAGES>]),
  userId: UserIdSchema,
});

// Video generation result schema
export const VideoGenerationResultSchema = z.object({
  jobId: GenerationJobIdSchema,
  status: z.nativeEnum(VideoRequestStatus),
  message: z.string(),
  estimatedDuration: z.number().positive().optional(),
});

// Video request schema (for queue management)
export const VideoRequestSchema = z.object({
  id: GenerationJobIdSchema,
  user_id: UserIdSchema,
  script_id: ScriptIdSchema.optional(),
  prompt: z.string(),
  selected_videos: z.array(VideoIdSchema),
  caption_config: CaptionConfigurationSchema,
  editorial_profile: VideoEditorialProfileSchema,
  output_language: z.enum(Object.keys(LANGUAGES) as [keyof typeof LANGUAGES, ...Array<keyof typeof LANGUAGES>]),
  status: z.nativeEnum(VideoRequestStatus),
  created_at: z.string(),
  updated_at: z.string(),
  error_message: z.string().optional(),
  video_url: z.string().url().optional(),
  thumbnail_url: z.string().url().optional(),
});

// API response schema
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    status: z.number(),
  });

// Video status response schema
export const VideoStatusResponseSchema = z.object({
  id: GenerationJobIdSchema,
  status: z.nativeEnum(VideoRequestStatus),
  progress: z.number().min(0).max(100).optional(),
  error_message: z.string().optional(),
  video_url: z.string().url().optional(),
  thumbnail_url: z.string().url().optional(),
  updated_at: z.string(),
});

// Scene plan schema
export const ScenePlanSchema = z.object({
  id: z.string(),
  startTime: z.number().min(0),
  endTime: z.number().min(0),
  duration: z.number().positive(),
  text: z.string(),
  videoId: VideoIdSchema,
});

// Template validation functions
export const validateVideoDuration = (
  scriptLength: number,
  videoDuration: number
): boolean => {
  const requiredDuration = scriptLength * VIDEO_DURATION_MULTIPLIER;
  return videoDuration >= requiredDuration;
};

export const validateCaptionConfig = (
  config: unknown
): config is z.infer<typeof CaptionConfigurationSchema> => {
  return CaptionConfigurationSchema.safeParse(config).success;
};

export const validateVideoEditorialProfile = (
  profile: unknown
): profile is z.infer<typeof VideoEditorialProfileSchema> => {
  return VideoEditorialProfileSchema.safeParse(profile).success;
};

export const validateVideoGenerationRequest = (
  request: unknown
): request is z.infer<typeof VideoGenerationRequestSchema> => {
  return VideoGenerationRequestSchema.safeParse(request).success;
};

// Type guards for runtime validation
export const isValidHexColor = (color: unknown): color is string => {
  return typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color);
};

export const isValidVideo = (video: unknown): video is z.infer<typeof VideoTypeSchema> => {
  return VideoTypeSchema.safeParse(video).success;
};

// Template validation result schema
export const TemplateValidationResultSchema = z.object({
  isValid: z.boolean(),
  warnings: z.array(z.string()),
  errors: z.array(z.string()),
  captionsEnabled: z.boolean(),
  totalDuration: z.number(),
  requiredDuration: z.number(),
});