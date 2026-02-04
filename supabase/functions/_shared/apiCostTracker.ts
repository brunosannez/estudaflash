// API Cost Tracking Utility
// Shared module for tracking API usage across edge functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

// Cost per 1000 tokens (in USD)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  // Anthropic Models
  'claude-sonnet-4-20250514': { input: 0.003, output: 0.015 },
  'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
  'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
  'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
  
  // OpenAI Models
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'gpt-5-2025-08-07': { input: 0.01, output: 0.03 }, // Estimated future model
  
  // DeepSeek Models
  'deepseek-v2': { input: 0.00014, output: 0.00028 },
  
  // Google Models
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
};

export interface ApiUsageData {
  userId: string;
  provider: 'anthropic' | 'openai' | 'google' | 'deepseek';
  actionType: 'summary' | 'flashcard' | 'quiz' | 'mind_map';
  model: string;
  inputTokens: number;
  outputTokens: number;
  success: boolean;
  errorMessage?: string;
}

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const costs = MODEL_COSTS[model];
  
  if (!costs) {
    // Default to Claude Haiku pricing if model not found
    console.warn(`⚠️ Unknown model for cost calculation: ${model}, using default pricing`);
    return ((inputTokens * 0.00025) + (outputTokens * 0.00125)) / 1000;
  }
  
  const inputCost = (inputTokens * costs.input) / 1000;
  const outputCost = (outputTokens * costs.output) / 1000;
  
  return inputCost + outputCost;
}

export function extractTokensFromAnthropicResponse(data: any): { input: number; output: number } {
  if (data?.usage) {
    return {
      input: data.usage.input_tokens || 0,
      output: data.usage.output_tokens || 0
    };
  }
  return { input: 0, output: 0 };
}

export function extractTokensFromOpenAIResponse(data: any): { input: number; output: number } {
  if (data?.usage) {
    return {
      input: data.usage.prompt_tokens || 0,
      output: data.usage.completion_tokens || 0
    };
  }
  return { input: 0, output: 0 };
}

export async function trackApiUsage(
  supabase: ReturnType<typeof createClient>,
  usage: ApiUsageData
): Promise<void> {
  try {
    const totalTokens = usage.inputTokens + usage.outputTokens;
    const estimatedCost = calculateCost(usage.model, usage.inputTokens, usage.outputTokens);
    
    const { error } = await supabase
      .from('api_usage_tracking')
      .insert({
        user_id: usage.userId,
        api_provider: usage.provider,
        action_type: usage.actionType,
        tokens_used: totalTokens,
        estimated_cost_usd: estimatedCost,
        model_used: usage.model,
        success: usage.success,
        error_message: usage.errorMessage || null,
        timestamp: new Date().toISOString()
      });
    
    if (error) {
      console.warn('⚠️ Failed to track API usage:', error.message);
    } else {
      console.log(`📊 API usage tracked: ${usage.provider}/${usage.model} - ${totalTokens} tokens - $${estimatedCost.toFixed(6)}`);
    }
  } catch (error) {
    // Don't fail the main operation if tracking fails
    console.warn('⚠️ Error tracking API usage:', error);
  }
}
