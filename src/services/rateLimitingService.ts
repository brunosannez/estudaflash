import { supabase } from '@/integrations/supabase/client';

export interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
}

export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  'upload': { maxRequests: 20, windowMinutes: 60 },
  'generate_quiz': { maxRequests: 50, windowMinutes: 60 },
  'generate_flashcards': { maxRequests: 50, windowMinutes: 60 },
  'generate_summary': { maxRequests: 30, windowMinutes: 60 },
  'api_call': { maxRequests: 100, windowMinutes: 60 },
};

export class RateLimitingService {
  static async checkRateLimit(actionType: string, userId?: string): Promise<boolean> {
    if (!userId) return true;

    const config = rateLimitConfigs[actionType];
    if (!config) return true;

    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        target_user_id: userId,
        target_action_type: actionType,
        max_requests: config.maxRequests,
        window_minutes: config.windowMinutes
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow on error to prevent blocking users
      }

      return data;
    } catch (error) {
      console.error('Rate limiting service error:', error);
      return true;
    }
  }

  static async logAction(actionType: string, userId?: string, metadata: any = {}): Promise<void> {
    if (!userId) return;

    try {
      await supabase.from('usage_logs').insert({
        user_id: userId,
        action_type: actionType,
        metadata
      });
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  }
}