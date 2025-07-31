import { supabase } from '@/integrations/supabase/client';
import { 
  EnhancedFlashcard, 
  FlashcardCategory, 
  FlashcardReview, 
  FlashcardStudyStats, 
  FlashcardStudyGoal,
  SpacedRepetitionResult,
  FlashcardDueForReview,
  StudyModeConfig
} from '@/types/flashcard';

export class EnhancedFlashcardService {
  // === FLASHCARDS ===
  static async getFlashcardsByMode(userId: string, config: StudyModeConfig): Promise<EnhancedFlashcard[]> {
    let query = supabase
      .from('flashcards')
      .select(`
        *,
        resumos!inner(
          uploads!inner(user_id)
        )
      `)
      .eq('resumos.uploads.user_id', userId);

    // Apply filters based on study mode
    switch (config.mode) {
      case 'spaced_repetition':
        if (config.includeOverdue) {
          query = query.lte('next_review_date', new Date().toISOString().split('T')[0]);
        }
        query = query.order('next_review_date', { ascending: true });
        break;
      
      case 'category':
        if (config.category) {
          query = query.eq('category', config.category);
        }
        break;
      
      case 'favorites':
        query = query.eq('is_favorite', true);
        break;
      
      case 'difficulty':
        if (config.difficulty) {
          query = query.eq('difficulty', config.difficulty);
        }
        break;
      
      case 'random':
      default:
        // Random order will be applied after fetching
        break;
    }

    if (config.maxCards) {
      query = query.limit(config.maxCards);
    }

    const { data, error } = await query;
    if (error) throw error;

    let flashcards = data as EnhancedFlashcard[] || [];

    // Apply random order if needed
    if (config.mode === 'random') {
      flashcards = flashcards.sort(() => Math.random() - 0.5);
    }

    return flashcards;
  }

  static async getFlashcardsDueForReview(userId: string): Promise<FlashcardDueForReview[]> {
    const { data, error } = await supabase.rpc('get_flashcards_due_for_review', {
      target_user_id: userId
    });

    if (error) throw error;
    return data || [];
  }

  static async updateFlashcardAfterReview(
    flashcardId: string, 
    quality: number, 
    responseTime: number
  ): Promise<void> {
    // Get current flashcard data
    const { data: flashcard, error: fetchError } = await supabase
      .from('flashcards')
      .select('ef_factor, repetition_count, difficulty')
      .eq('id', flashcardId)
      .single();

    if (fetchError) throw fetchError;

    // Calculate next review date using the database function
    const { data: reviewData, error: reviewError } = await supabase.rpc('calculate_next_review_date', {
      current_ef_factor: flashcard.ef_factor,
      repetition_count: flashcard.repetition_count,
      quality: quality
    });

    if (reviewError) throw reviewError;

    const result = reviewData[0] as SpacedRepetitionResult;

    // Update flashcard with new spaced repetition data
    const { error: updateError } = await supabase
      .from('flashcards')
      .update({
        ef_factor: result.new_ef_factor,
        repetition_count: result.new_repetition_count,
        next_review_date: result.next_date,
        last_reviewed_at: new Date().toISOString()
      })
      .eq('id', flashcardId);

    if (updateError) throw updateError;
  }

  static async updateFlashcard(flashcardId: string, updates: Partial<EnhancedFlashcard>): Promise<EnhancedFlashcard> {
    const { data, error } = await supabase
      .from('flashcards')
      .update(updates)
      .eq('id', flashcardId)
      .select()
      .single();

    if (error) throw error;
    return data as EnhancedFlashcard;
  }

  // === CATEGORIES ===
  static async getCategories(userId: string): Promise<FlashcardCategory[]> {
    const { data, error } = await supabase
      .from('flashcard_categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async createCategory(category: Omit<FlashcardCategory, 'id' | 'created_at' | 'updated_at'>): Promise<FlashcardCategory> {
    const { data, error } = await supabase
      .from('flashcard_categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCategory(categoryId: string, updates: Partial<FlashcardCategory>): Promise<FlashcardCategory> {
    const { data, error } = await supabase
      .from('flashcard_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('flashcard_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  }

  // === REVIEWS ===
  static async createReview(review: Omit<FlashcardReview, 'id' | 'data_review'>): Promise<FlashcardReview> {
    const { data, error } = await supabase
      .from('flashcard_reviews')
      .insert({
        ...review,
        data_review: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // === STATS ===
  static async updateStudyStats(userId: string, stats: Partial<FlashcardStudyStats>): Promise<FlashcardStudyStats> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('flashcard_study_stats')
      .upsert({
        user_id: userId,
        study_date: today,
        ...stats,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getStudyStats(userId: string, days: number = 30): Promise<FlashcardStudyStats[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('flashcard_study_stats')
      .select('*')
      .eq('user_id', userId)
      .gte('study_date', startDate.toISOString().split('T')[0])
      .order('study_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // === GOALS ===
  static async getActiveGoals(userId: string): Promise<FlashcardStudyGoal[]> {
    const { data, error } = await supabase
      .from('flashcard_study_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as FlashcardStudyGoal[] || [];
  }

  static async createGoal(goal: Omit<FlashcardStudyGoal, 'id' | 'created_at' | 'updated_at'>): Promise<FlashcardStudyGoal> {
    const { data, error } = await supabase
      .from('flashcard_study_goals')
      .insert(goal)
      .select()
      .single();

    if (error) throw error;
    return data as FlashcardStudyGoal;
  }

  static async updateGoalProgress(goalId: string, progress: number): Promise<FlashcardStudyGoal> {
    const { data, error } = await supabase
      .from('flashcard_study_goals')
      .update({ 
        current_progress: progress,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return data as FlashcardStudyGoal;
  }

  static async completeGoal(goalId: string): Promise<FlashcardStudyGoal> {
    const { data, error } = await supabase
      .from('flashcard_study_goals')
      .update({ 
        is_active: false,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return data as FlashcardStudyGoal;
  }

  // === ANALYTICS ===
  static async getFlashcardAnalytics(userId: string) {
    const [categories, dueCards, recentStats] = await Promise.all([
      this.getCategories(userId),
      this.getFlashcardsDueForReview(userId),
      this.getStudyStats(userId, 7)
    ]);

    const totalCards = await supabase
      .from('flashcards')
      .select('id', { count: 'exact' })
      .eq('resumos.uploads.user_id', userId);

    return {
      totalCards: totalCards.count || 0,
      dueCards: dueCards.length,
      categories: categories.length,
      weeklyStats: recentStats,
      overdueCards: dueCards.filter(card => card.days_overdue > 0).length
    };
  }
}