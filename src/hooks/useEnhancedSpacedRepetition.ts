import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SpacedRepetitionResult {
  next_date: string;
  new_ef_factor: number;
  new_repetition_count: number;
  difficulty_adjustment: number;
}

export interface EnhancedReviewData {
  flashcard_id: string;
  review_quality: number; // 0-5 (SM-2 scale)
  response_time_ms: number;
  confidence_level: number; // 1-5
  study_context?: Record<string, any>;
}

export const useEnhancedSpacedRepetition = () => {
  const [loading, setLoading] = useState(false);

  const calculateNextReview = useCallback(async (
    current_ef_factor: number,
    repetition_count: number,
    quality: number,
    response_time_ms: number = 0,
    confidence_level: number = 3
  ): Promise<SpacedRepetitionResult | null> => {
    try {
      const { data, error } = await supabase.rpc('calculate_enhanced_spaced_repetition', {
        current_ef_factor,
        repetition_count,
        quality,
        response_time_ms,
        confidence_level
      });

      if (error) throw error;
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Error calculating spaced repetition:', error);
      return null;
    }
  }, []);

  const recordEnhancedReview = useCallback(async (reviewData: EnhancedReviewData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current flashcard data
      const { data: flashcard } = await supabase
        .from('flashcards')
        .select('ef_factor, repetition_count, next_review_date')
        .eq('id', reviewData.flashcard_id)
        .single();

      if (!flashcard) throw new Error('Flashcard not found');

      // Calculate new spaced repetition values
      const spacedResult = await calculateNextReview(
        flashcard.ef_factor,
        flashcard.repetition_count,
        reviewData.review_quality,
        reviewData.response_time_ms,
        reviewData.confidence_level
      );

      if (!spacedResult) throw new Error('Failed to calculate spaced repetition');

      // Record the enhanced review
      const { error: reviewError } = await supabase
        .from('enhanced_flashcard_reviews')
        .insert({
          flashcard_id: reviewData.flashcard_id,
          user_id: user.id,
          review_quality: reviewData.review_quality,
          response_time_ms: reviewData.response_time_ms,
          confidence_level: reviewData.confidence_level,
          previous_ef_factor: flashcard.ef_factor,
          new_ef_factor: spacedResult.new_ef_factor,
          previous_repetition_count: flashcard.repetition_count,
          new_repetition_count: spacedResult.new_repetition_count,
          previous_review_date: flashcard.next_review_date,
          next_review_date: spacedResult.next_date,
          study_context: reviewData.study_context || {}
        });

      if (reviewError) throw reviewError;

      // Update flashcard with new values
      const { error: updateError } = await supabase
        .from('flashcards')
        .update({
          ef_factor: spacedResult.new_ef_factor,
          repetition_count: spacedResult.new_repetition_count,
          next_review_date: spacedResult.next_date,
          last_reviewed_at: new Date().toISOString()
        })
        .eq('id', reviewData.flashcard_id);

      if (updateError) throw updateError;

      return spacedResult;
    } catch (error) {
      console.error('Error recording enhanced review:', error);
      toast.error('Erro ao registrar revisão avançada');
      return null;
    } finally {
      setLoading(false);
    }
  }, [calculateNextReview]);

  const getCardsForReview = useCallback(async (includeOverdue: boolean = true) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('get_flashcards_due_for_review', {
        target_user_id: user.id
      });

      if (error) throw error;

      if (includeOverdue) {
        return data || [];
      } else {
        return data?.filter(card => card.days_overdue <= 0) || [];
      }
    } catch (error) {
      console.error('Error getting cards for review:', error);
      return [];
    }
  }, []);

  return {
    loading,
    calculateNextReview,
    recordEnhancedReview,
    getCardsForReview
  };
};