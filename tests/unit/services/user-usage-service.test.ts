/**
 * UserUsageService Tests
 */

import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { UserUsageService } from '../../../src/services/user-usage/user-usage-service';
import { PlanIdentifier } from '../../../src/types';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

describe('UserUsageService', () => {
  beforeEach(() => {
    // Clear the singleton instance before each test
    UserUsageService.clearInstance();
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should create a singleton instance', () => {
      const instance1 = UserUsageService.getInstance(mockSupabaseClient as any);
      const instance2 = UserUsageService.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should throw error if no supabaseClient provided on first call', () => {
      expect(() => UserUsageService.getInstance()).toThrow(
        'UserUsageService must be initialized with supabaseClient first'
      );
    });
  });

  describe('createUserUsage', () => {
    let service: UserUsageService;

    beforeEach(() => {
      service = UserUsageService.getInstance(mockSupabaseClient as any);
    });

    it('should create user usage record with free plan by default', async () => {
      const mockPlanData = {
        videos_generated_limit: 3,
        source_videos_limit: 2,
        voice_clones_limit: 1,
        account_analysis_limit: 1,
        script_conversations_limit: 5,
      };

      const mockUserUsage = {
        user_id: 'test-user',
        current_plan_id: 'free',
        videos_generated: 0,
        videos_generated_limit: 3,
        source_videos_used: 0,
        source_videos_limit: 2,
        voice_clones_used: 0,
        voice_clones_limit: 1,
        account_analysis_used: 0,
        account_analysis_limit: 1,
        script_conversations_used: 0,
        script_conversations_limit: 5,
      };

      // Mock plan fetch
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockPlanData,
        error: null,
      });

      // Mock user usage insert
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockUserUsage,
        error: null,
      });

      const result = await service.createUserUsage('test-user');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('subscription_plans');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_usage');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'free');
      expect(result).toEqual(mockUserUsage);
    });

    it('should handle plan fetch error', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: new Error('Plan not found'),
      });

      const result = await service.createUserUsage('test-user');

      expect(result).toBeNull();
    });

    it('should handle user usage insert error', async () => {
      const mockPlanData = {
        videos_generated_limit: 3,
        source_videos_limit: 2,
        voice_clones_limit: 1,
        account_analysis_limit: 1,
        script_conversations_limit: 5,
      };

      // Mock plan fetch success
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockPlanData,
        error: null,
      });

      // Mock user usage insert error
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: new Error('Insert failed'),
      });

      const result = await service.createUserUsage('test-user');

      expect(result).toBeNull();
    });
  });

  describe('getUserUsage', () => {
    let service: UserUsageService;

    beforeEach(() => {
      service = UserUsageService.getInstance(mockSupabaseClient as any);
    });

    it('should return existing user usage record', async () => {
      const mockUserUsage = {
        user_id: 'test-user',
        current_plan_id: 'free',
        videos_generated: 1,
        videos_generated_limit: 3,
      };

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockUserUsage,
        error: null,
      });

      const result = await service.getUserUsage('test-user');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_usage');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', 'test-user');
      expect(result).toEqual(mockUserUsage);
    });

    it('should create new record if none exists (PGRST116 error)', async () => {
      const mockPlanData = {
        videos_generated_limit: 3,
        source_videos_limit: 2,
        voice_clones_limit: 1,
        account_analysis_limit: 1,
        script_conversations_limit: 5,
      };

      const mockNewUserUsage = {
        user_id: 'test-user',
        current_plan_id: 'free',
        videos_generated: 0,
        videos_generated_limit: 3,
      };

      // Mock getUserUsage returning no record found error
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Mock plan fetch for createUserUsage
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockPlanData,
        error: null,
      });

      // Mock user usage insert for createUserUsage
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockNewUserUsage,
        error: null,
      });

      const result = await service.getUserUsage('test-user');

      expect(result).toEqual(mockNewUserUsage);
    });
  });

  describe('updateUserPlan', () => {
    let service: UserUsageService;

    beforeEach(() => {
      service = UserUsageService.getInstance(mockSupabaseClient as any);
    });

    it('should update user plan successfully', async () => {
      const mockExistingUsage = {
        user_id: 'test-user',
        current_plan_id: 'free',
        videos_generated: 1,
        videos_generated_limit: 3,
      };

      const mockPlanData = {
        videos_generated_limit: 10,
        source_videos_limit: 5,
        voice_clones_limit: 3,
        account_analysis_limit: 5,
        script_conversations_limit: 20,
      };

      const mockUpdatedUsage = {
        ...mockExistingUsage,
        current_plan_id: 'pro',
        videos_generated_limit: 10,
        source_videos_limit: 5,
        voice_clones_limit: 3,
        account_analysis_limit: 5,
        script_conversations_limit: 20,
      };

      // Mock getUserUsage call
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockExistingUsage,
        error: null,
      });

      // Mock plan fetch
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockPlanData,
        error: null,
      });

      // Mock update call
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockUpdatedUsage,
        error: null,
      });

      const result = await service.updateUserPlan('test-user', 'pro');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('subscription_plans');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_usage');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'pro');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('user_id', 'test-user');
      expect(result).toEqual(mockUpdatedUsage);
    });

    it('should create new record if user usage does not exist', async () => {
      const mockPlanData = {
        videos_generated_limit: 10,
        source_videos_limit: 5,
        voice_clones_limit: 3,
        account_analysis_limit: 5,
        script_conversations_limit: 20,
      };

      const mockNewUsage = {
        user_id: 'test-user',
        current_plan_id: 'pro',
        videos_generated: 0,
        videos_generated_limit: 10,
      };

      // Mock getUserUsage returning null (no existing record)
      // This will be called in updateUserPlan
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      // When getUserUsage is called within createUserUsage, it should return PGRST116 error
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Mock plan fetch for createUserUsage  
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockPlanData,
        error: null,
      });

      // Mock user usage insert for createUserUsage
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockNewUsage,
        error: null,
      });

      const result = await service.updateUserPlan('test-user', 'pro');

      expect(result).toEqual(mockNewUsage);
    });
  });

  describe('incrementUsage', () => {
    let service: UserUsageService;

    beforeEach(() => {
      service = UserUsageService.getInstance(mockSupabaseClient as any);
    });

    it('should increment usage for valid field', async () => {
      const mockExistingUsage = {
        user_id: 'test-user',
        videos_generated: 2,
        videos_generated_limit: 10,
      };

      // Mock getUserUsage call
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockExistingUsage,
        error: null,
      });

      // Mock update call
      mockSupabaseClient.update.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const result = await service.incrementUsage('test-user', 'videos_generated', 1);

      expect(result).toBe(true);
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({
        videos_generated: 3,
        updated_at: expect.any(String),
      });
    });

    it('should return false for invalid field', async () => {
      const mockExistingUsage = {
        user_id: 'test-user',
        videos_generated: 2,
      };

      // Mock getUserUsage call
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockExistingUsage,
        error: null,
      });

      const result = await service.incrementUsage('test-user', 'invalid_field' as any, 1);

      expect(result).toBe(false);
    });

    it('should return false if no usage record found', async () => {
      const result = await service.incrementUsage('test-user', 'videos_generated', 1);

      expect(result).toBe(false);
    });
  });

  describe('checkUsageLimit', () => {
    let service: UserUsageService;

    beforeEach(() => {
      service = UserUsageService.getInstance(mockSupabaseClient as any);
    });

    it('should return false when usage is below limit', async () => {
      const mockUsage = {
        user_id: 'test-user',
        videos_generated: 2,
        videos_generated_limit: 10,
      };

      // Mock getUserUsage call
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockUsage,
        error: null,
      });

      const result = await service.checkUsageLimit('test-user', 'videos_generated');

      expect(result).toBe(false);
    });

    it('should return true when usage reaches limit', async () => {
      const mockUsage = {
        user_id: 'test-user',
        videos_generated: 10,
        videos_generated_limit: 10,
      };

      // Mock getUserUsage call
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockUsage,
        error: null,
      });

      const result = await service.checkUsageLimit('test-user', 'videos_generated');

      expect(result).toBe(true);
    });

    it('should return false for unlimited usage (-1)', async () => {
      const mockUsage = {
        user_id: 'test-user',
        videos_generated: 100,
        videos_generated_limit: -1,
      };

      // Mock getUserUsage call
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockUsage,
        error: null,
      });

      const result = await service.checkUsageLimit('test-user', 'videos_generated');

      expect(result).toBe(false);
    });

    it('should return true if no usage record found', async () => {
      const result = await service.checkUsageLimit('test-user', 'videos_generated');

      expect(result).toBe(true);
    });
  });
});