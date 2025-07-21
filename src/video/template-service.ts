/**
 * Unified Video Template Service
 * Consolidates video template operations with validation
 */

import type {
  VideoType,
  CaptionConfiguration,
  ScenePlan,
  TemplateValidationResult,
} from './types';
import { VIDEO_DURATION_MULTIPLIER } from './constants';
import { validateVideoDuration } from './validation';

/**
 * Service for managing video templates with comprehensive validation
 */
export class VideoTemplateService {
  /**
   * Validates a video template with caption and duration checks
   * 
   * @param scriptText - The script text to validate against
   * @param selectedVideos - Videos selected for the template
   * @param captionConfig - Caption configuration
   * @returns Validation result with warnings and errors
   */
  static validateTemplate(
    scriptText: string,
    selectedVideos: VideoType[],
    captionConfig: CaptionConfiguration
  ): TemplateValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Calculate script duration requirements
    const scriptLength = scriptText.length;
    const requiredDuration = scriptLength * VIDEO_DURATION_MULTIPLIER;
    
    // Calculate total available video duration
    const totalDuration = selectedVideos.reduce((total, video) => {
      return total + (video.duration_seconds || 0);
    }, 0);
    
    // Validate each video duration individually
    const insufficientVideos = selectedVideos.filter(video => {
      const videoDuration = video.duration_seconds || 0;
      return !validateVideoDuration(scriptLength, videoDuration);
    });
    
    // Check overall duration
    if (totalDuration < requiredDuration) {
      errors.push(
        `Insufficient video duration. Required: ${Math.round(requiredDuration)}s, Available: ${Math.round(totalDuration)}s`
      );
    }
    
    // Check individual video durations
    if (insufficientVideos.length > 0) {
      warnings.push(
        `${insufficientVideos.length} video(s) may be too short for the script length`
      );
    }
    
    // Check caption configuration
    if (captionConfig.enabled && !captionConfig.placement) {
      warnings.push('Captions enabled but no placement specified');
    }
    
    // Check if videos have analysis data for better selection
    const videosWithoutAnalysis = selectedVideos.filter(video => !video.analysis_data);
    if (videosWithoutAnalysis.length > 0) {
      warnings.push(
        `${videosWithoutAnalysis.length} video(s) lack analysis data for optimal template generation`
      );
    }
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      captionsEnabled: captionConfig.enabled,
      totalDuration: Math.round(totalDuration),
      requiredDuration: Math.round(requiredDuration),
    };
  }
  
  /**
   * Generates a scene plan for video template
   * Removes caption elements if captions are disabled
   * 
   * @param scriptText - The script text
   * @param selectedVideos - Videos to use in template
   * @param captionConfig - Caption configuration
   * @returns Array of scene plans
   */
  static generateScenePlan(
    scriptText: string,
    selectedVideos: VideoType[],
    captionConfig: CaptionConfiguration
  ): ScenePlan[] {
    const scenePlans: ScenePlan[] = [];
    const words = scriptText.split(' ').filter(word => word.trim());
    const wordsPerSecond = 2.5; // Conservative speaking rate
    
    let currentTime = 0;
    let videoIndex = 0;
    
    // Split script into scenes based on video availability
    const wordsPerScene = Math.ceil(words.length / selectedVideos.length);
    
    for (let i = 0; i < words.length; i += wordsPerScene) {
      const sceneWords = words.slice(i, i + wordsPerScene);
      const sceneDuration = sceneWords.length / wordsPerSecond;
      
      if (videoIndex < selectedVideos.length) {
        const video = selectedVideos[videoIndex];
        const videoDuration = video.duration_seconds || 0;
        
        // Use the minimum of scene duration or video duration
        const actualDuration = Math.min(sceneDuration, videoDuration);
        
        scenePlans.push({
          id: `scene-${videoIndex}`,
          startTime: currentTime,
          endTime: currentTime + actualDuration,
          duration: actualDuration,
          text: sceneWords.join(' '),
          videoId: video.id as any, // Cast to branded type
        });
        
        currentTime += actualDuration;
        videoIndex++;
      }
    }
    
    return scenePlans;
  }
  
  /**
   * Processes template configuration by removing captions if disabled
   * 
   * @param template - Base template configuration
   * @param captionConfig - Caption configuration
   * @returns Processed template with captions removed if disabled
   */
  static processTemplate(
    template: any,
    captionConfig: CaptionConfiguration
  ): any {
    const processedTemplate = { ...template };
    
    if (!captionConfig.enabled) {
      // Remove caption-related elements from template
      if (processedTemplate.elements) {
        processedTemplate.elements = processedTemplate.elements.filter(
          (element: any) => element.type !== 'text' && element.type !== 'caption'
        );
      }
      
      if (processedTemplate.tracks) {
        processedTemplate.tracks = processedTemplate.tracks.filter(
          (track: any) => track.type !== 'subtitle' && track.type !== 'caption'
        );
      }
    } else {
      // Apply caption configuration
      if (processedTemplate.elements) {
        processedTemplate.elements.forEach((element: any) => {
          if (element.type === 'text' || element.type === 'caption') {
            // Apply caption styling
            if (captionConfig.transcriptColor) {
              element.fill = captionConfig.transcriptColor;
            }
            if (captionConfig.placement) {
              element.y = this.getCaptionYPosition(captionConfig.placement);
            }
            if (captionConfig.transcriptEffect) {
              element.effect = captionConfig.transcriptEffect;
            }
          }
        });
      }
    }
    
    return processedTemplate;
  }
  
  /**
   * Gets Y position for caption placement
   * 
   * @param placement - Caption placement option
   * @returns Y coordinate for caption positioning
   */
  private static getCaptionYPosition(placement: 'top' | 'center' | 'bottom'): string {
    switch (placement) {
      case 'top':
        return '10%';
      case 'center':
        return '50%';
      case 'bottom':
        return '85%';
      default:
        return '85%'; // Default to bottom
    }
  }
  
  /**
   * Validates script length against available video durations
   * 
   * @param scriptText - The script text
   * @param videos - Available videos
   * @returns Whether the script can be accommodated by the videos
   */
  static canAccommodateScript(scriptText: string, videos: VideoType[]): boolean {
    const scriptLength = scriptText.length;
    const totalVideoDuration = videos.reduce((total, video) => {
      return total + (video.duration_seconds || 0);
    }, 0);
    
    const requiredDuration = scriptLength * VIDEO_DURATION_MULTIPLIER;
    return totalVideoDuration >= requiredDuration;
  }
  
  /**
   * Gets recommended video duration for a given script
   * 
   * @param scriptText - The script text
   * @returns Recommended minimum video duration in seconds
   */
  static getRecommendedDuration(scriptText: string): number {
    return Math.ceil(scriptText.length * VIDEO_DURATION_MULTIPLIER);
  }
}