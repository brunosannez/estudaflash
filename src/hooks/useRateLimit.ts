import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitOptions {
  maxRequests: number;
  windowMinutes: number;
  action: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  currentCount: number;
}

export const useRateLimit = () => {
  const [isRateLimited, setIsRateLimited] = useState<Record<string, boolean>>({});

  const checkRateLimit = useCallback(async (
    options: RateLimitOptions
  ): Promise<RateLimitResult> => {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        target_user_id: (await supabase.auth.getUser()).data.user?.id,
        target_action_type: options.action,
        max_requests: options.maxRequests,
        window_minutes: options.windowMinutes
      });

      if (error) {
        console.error('Rate limit check error:', error);
        // On error, allow the action but log it
        return {
          allowed: true,
          remaining: options.maxRequests - 1,
          resetTime: new Date(Date.now() + options.windowMinutes * 60 * 1000),
          currentCount: 0
        };
      }

      const allowed = data as boolean;
      
      // Calculate remaining and reset time (approximate)
      const windowStart = new Date();
      windowStart.setMinutes(windowStart.getMinutes() - options.windowMinutes);
      
      // Get current request count for this window (approximate)
      const { data: rateLimitData } = await supabase
        .from('rate_limiting_enhanced')
        .select('request_count')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('action_type', options.action)
        .gte('window_start', windowStart.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const currentCount = rateLimitData?.request_count || 0;
      const remaining = Math.max(0, options.maxRequests - currentCount - 1);
      const resetTime = new Date(Date.now() + options.windowMinutes * 60 * 1000);

      // Update local rate limit state
      setIsRateLimited(prev => ({
        ...prev,
        [options.action]: !allowed
      }));

      return {
        allowed,
        remaining,
        resetTime,
        currentCount: currentCount + (allowed ? 1 : 0)
      };

    } catch (error) {
      console.error('Rate limit check failed:', error);
      // On failure, allow the action to prevent blocking legitimate users
      return {
        allowed: true,
        remaining: options.maxRequests - 1,
        resetTime: new Date(Date.now() + options.windowMinutes * 60 * 1000),
        currentCount: 0
      };
    }
  }, []);

  const logRateLimitViolation = useCallback(async (
    action: string, 
    details?: Record<string, any>
  ) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      await supabase
        .from('rate_limiting_enhanced')
        .insert({
          user_id: user.id,
          action_type: `rate_limit_violation_${action}`,
          request_count: 1,
          window_start: new Date().toISOString()
        });

      // Also log as security event
      await supabase.rpc('log_sensitive_access', {
        action_type_param: 'rate_limit_violation',
        resource_type_param: 'security',
        details_param: {
          violated_action: action,
          timestamp: new Date().toISOString(),
          ...details
        }
      });

    } catch (error) {
      console.error('Failed to log rate limit violation:', error);
    }
  }, []);

  // Predefined rate limit configurations for common actions
  const rateLimits = {
    upload: { maxRequests: 10, windowMinutes: 60, action: 'upload' },
    quiz_generation: { maxRequests: 20, windowMinutes: 60, action: 'quiz_generation' },
    flashcard_generation: { maxRequests: 15, windowMinutes: 60, action: 'flashcard_generation' },
    summary_generation: { maxRequests: 10, windowMinutes: 60, action: 'summary_generation' },
    guardian_access: { maxRequests: 5, windowMinutes: 60, action: 'guardian_access' },
    admin_action: { maxRequests: 50, windowMinutes: 60, action: 'admin_action' },
    profile_update: { maxRequests: 10, windowMinutes: 60, action: 'profile_update' },
    social_interaction: { maxRequests: 100, windowMinutes: 60, action: 'social_interaction' }
  };

  const checkUploadRateLimit = useCallback(() => 
    checkRateLimit(rateLimits.upload), [checkRateLimit]);

  const checkQuizGenerationRateLimit = useCallback(() => 
    checkRateLimit(rateLimits.quiz_generation), [checkRateLimit]);

  const checkFlashcardGenerationRateLimit = useCallback(() => 
    checkRateLimit(rateLimits.flashcard_generation), [checkRateLimit]);

  const checkSummaryGenerationRateLimit = useCallback(() => 
    checkRateLimit(rateLimits.summary_generation), [checkRateLimit]);

  const checkGuardianAccessRateLimit = useCallback(() => 
    checkRateLimit(rateLimits.guardian_access), [checkRateLimit]);

  const checkAdminActionRateLimit = useCallback(() => 
    checkRateLimit(rateLimits.admin_action), [checkRateLimit]);

  const checkProfileUpdateRateLimit = useCallback(() => 
    checkRateLimit(rateLimits.profile_update), [checkRateLimit]);

  const checkSocialInteractionRateLimit = useCallback(() => 
    checkRateLimit(rateLimits.social_interaction), [checkRateLimit]);

  return {
    checkRateLimit,
    logRateLimitViolation,
    isRateLimited,
    // Convenience methods for common actions
    checkUploadRateLimit,
    checkQuizGenerationRateLimit,
    checkFlashcardGenerationRateLimit,
    checkSummaryGenerationRateLimit,
    checkGuardianAccessRateLimit,
    checkAdminActionRateLimit,
    checkProfileUpdateRateLimit,
    checkSocialInteractionRateLimit
  };
};