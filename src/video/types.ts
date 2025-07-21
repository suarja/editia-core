/**
 * Shared video generation types
 * Consolidated from mobile and server-primary to eliminate duplication
 */

import type { Brand } from '../types/compatibility';
import type { 
  Language, 
  VideoRequestStatus, 
  CaptionPlacement, 
  TranscriptEffect 
} from './constants';

// Branded types for domain safety
export type VideoId = Brand<string, 'VideoId'>;
export type ScriptId = Brand<string, 'ScriptId'>;
export type UserId = Brand<string, 'UserId'>;
export type GenerationJobId = Brand<string, 'GenerationJobId'>;

// Utility types
export type HexColor = Brand<string, 'HexColor'>;

// Base video interface (unified from mobile and server differences)
export interface VideoType {
  id: VideoId;
  title: string;
  description: string;
  upload_url: string;
  tags: string[];
  user_id: UserId;
  created_at: string;
  updated_at: string;
  duration_seconds: number | null;
  thumbnail_url?: string;
  file_size?: number;
  processing_status?: VideoRequestStatus;
  // Optional analysis data (server-specific, can be extended)
  analysis_data?: unknown;
  analysis_status?: VideoRequestStatus;
}

// Caption configuration interface (unified from both services)
export interface CaptionConfiguration {
  enabled: boolean;
  presetId?: string;
  placement: CaptionPlacement;
  transcriptColor?: HexColor;
  transcriptEffect?: TranscriptEffect;
}

// Editorial profile interface for video generation (unified from both services)
export interface VideoEditorialProfile {
  persona_description: string;
  tone_of_voice: string;
  audience: string;
  style_notes: string;
  examples?: string;
}

// Enhanced generated video type (from mobile)
export interface EnhancedGeneratedVideoType {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds: number;
  file_size?: number;
  created_at: string;
  status: VideoRequestStatus;
  script_id?: ScriptId;
  prompt?: string;
  error_message?: string;
}

// Video generation request (main request interface)
export interface VideoGenerationRequest {
  scriptId?: ScriptId;
  prompt: string;
  selectedVideoIds: VideoId[];
  captionConfig: CaptionConfiguration;
  editorialProfile: VideoEditorialProfile;
  outputLanguage: Language;
  userId: UserId;
}

// Video generation result (server response)
export interface VideoGenerationResult {
  jobId: GenerationJobId;
  status: VideoRequestStatus;
  message: string;
  estimatedDuration?: number;
}

// Video request for queue management (server-side)
export interface VideoRequest {
  id: GenerationJobId;
  user_id: UserId;
  script_id?: ScriptId;
  prompt: string;
  selected_videos: VideoId[];
  caption_config: CaptionConfiguration;
  editorial_profile: VideoEditorialProfile;
  output_language: Language;
  status: VideoRequestStatus;
  created_at: string;
  updated_at: string;
  error_message?: string;
  video_url?: string;
  thumbnail_url?: string;
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

// Video status response for polling
export interface VideoStatusResponse {
  id: GenerationJobId;
  status: VideoRequestStatus;
  progress?: number;
  error_message?: string;
  video_url?: string;
  thumbnail_url?: string;
  updated_at: string;
}

// Scene plan for video template (server-specific)
export interface ScenePlan {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  text: string;
  videoId: VideoId;
}

// Template validation result
export interface TemplateValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  captionsEnabled: boolean;
  totalDuration: number;
  requiredDuration: number;
}