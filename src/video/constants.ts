/**
 * Video generation constants and enums
 * Shared across mobile and server-primary services
 */

// Language support for video generation
export type Language = 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko' | 'zh';

export const LANGUAGES: Record<Language, string> = {
  en: 'English',
  fr: 'Français', 
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
} as const;

// Unified video request status (resolving mobile vs server differences)
export enum VideoRequestStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing', // Unified name (was 'rendering' in server)
  COMPLETED = 'completed',   // Unified name (was 'done' in server)
  FAILED = 'failed',         // Unified name (was 'error' in server)
}

// Caption placement options
export const CAPTION_PLACEMENTS = ['top', 'center', 'bottom'] as const;
export type CaptionPlacement = typeof CAPTION_PLACEMENTS[number];

// Transcript effects
export const TRANSCRIPT_EFFECTS = [
  'karaoke',
  'highlight',
  'fade',
  'bounce',
  'slide',
  'enlarge',
] as const;
export type TranscriptEffect = typeof TRANSCRIPT_EFFECTS[number];

// Video template validation constants
export const VIDEO_DURATION_MULTIPLIER = 0.8; // Conservative formula: script_length * 0.8