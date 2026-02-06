import { supabase } from '@/integrations/supabase/client';

export class DataSeederService {
  private static hasSeeded = false;

  static async seedInitialData() {
    if (this.hasSeeded) return;

    try {
      // Verify user is authenticated before seeding
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('⏭️ Skipping data seeding - user not authenticated');
        return;
      }

      console.log('🌱 Starting data seeding...');

      // Check if data already exists
      const [challengesResult, leaderboardResult] = await Promise.all([
        supabase.from('challenges').select('id').limit(1),
        supabase.from('leaderboards').select('id').limit(1)
      ]);

      const needsChallenges = challengesResult.data?.length === 0;
      const needsLeaderboard = leaderboardResult.data?.length === 0;

      if (needsChallenges) {
        await this.seedChallenges();
      }

      if (needsLeaderboard) {
        await this.seedLeaderboardForUser(user.id);
      }

      this.hasSeeded = true;
      console.log('✅ Data seeding completed');
    } catch (error) {
      console.error('❌ Error seeding data:', error);
    }
  }

  private static async seedChallenges() {
    const challenges = [
      {
        title: 'Sequência de Estudos',
        description: 'Estude por 3 dias consecutivos',
        type: 'daily',
        category: 'streak',
        target_value: 3,
        xp_reward: 150,
        badge_reward: '🔥 Consistência',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true
      },
      {
        title: 'Mestre dos Flashcards',
        description: 'Estude 100 flashcards esta semana',
        type: 'weekly',
        category: 'flashcards',
        target_value: 100,
        xp_reward: 200,
        badge_reward: '🧠 Flashcard Expert',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true
      },
      {
        title: 'Quiz Champion',
        description: 'Complete 10 quizzes com 80%+ de acerto',
        type: 'weekly',
        category: 'quiz',
        target_value: 10,
        xp_reward: 300,
        badge_reward: '🏆 Quiz Master',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true
      },
      {
        title: 'Explorador do Conhecimento',
        description: 'Crie resumos de 5 materiais diferentes',
        type: 'monthly',
        category: 'summary',
        target_value: 5,
        xp_reward: 250,
        badge_reward: '🗺️ Explorador',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true
      },
      {
        title: 'Maratonista dos Estudos',
        description: 'Acumule 2 horas de estudo hoje',
        type: 'daily',
        category: 'time',
        target_value: 120,
        xp_reward: 100,
        badge_reward: '⏱️ Maratonista',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true
      },
      {
        title: 'Daily Grind',
        description: 'Complete pelo menos 1 atividade hoje',
        type: 'daily',
        category: 'flashcards',
        target_value: 1,
        xp_reward: 50,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        is_active: true
      }
    ];

    const { error } = await supabase
      .from('challenges')
      .insert(challenges);

    if (error) {
      console.warn('⚠️ Could not seed challenges (may need admin privileges):', error.message);
    } else {
      console.log('📝 Challenges seeded');
    }
  }

  private static async seedLeaderboardForUser(userId: string) {
    const categories = ['xp', 'flashcards', 'quiz', 'streak'];
    const periods = ['daily', 'weekly', 'monthly', 'all_time'];

    const leaderboardEntries = [];

    for (const category of categories) {
      for (const period of periods) {
        const periodStart = new Date();
        const periodEnd = new Date();

        switch (period) {
          case 'daily':
            break;
          case 'weekly':
            periodStart.setDate(periodStart.getDate() - 7);
            break;
          case 'monthly':
            periodStart.setMonth(periodStart.getMonth() - 1);
            break;
          case 'all_time':
            periodStart.setFullYear(2020);
            periodEnd.setFullYear(2030);
            break;
        }

        leaderboardEntries.push({
          user_id: userId,
          period_type: period,
          category: category,
          value: 0,
          rank_position: 1,
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0]
        });
      }
    }

    const { error } = await supabase
      .from('leaderboards')
      .insert(leaderboardEntries);

    if (error) {
      console.warn('⚠️ Could not seed leaderboard:', error.message);
    } else {
      console.log('🏆 Leaderboard seeded for current user');
    }
  }

  static async seedUserInitialData(userId: string) {
    try {
      // Create initial progress if not exists
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!existingProgress) {
        await supabase
          .from('user_progress')
          .insert({
            user_id: userId,
            total_xp: 0,
            current_level: 1,
            current_streak: 0,
            longest_streak: 0
          });
      }

      // Create daily activity if not exists
      const today = new Date().toISOString().split('T')[0];
      const { data: existingActivity } = await supabase
        .from('daily_activities')
        .select('id')
        .eq('user_id', userId)
        .eq('activity_date', today)
        .single();

      if (!existingActivity) {
        await supabase
          .from('daily_activities')
          .insert({
            user_id: userId,
            activity_date: today,
            flashcards_reviewed: 0,
            quizzes_completed: 0,
            quiz_correct_answers: 0,
            xp_earned: 0
          });
      }

      console.log('✅ User initial data seeded for:', userId);
    } catch (error) {
      console.error('❌ Error seeding user data:', error);
    }
  }

  static async cleanupOldData() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Clean old social activities
      await supabase
        .from('social_activities')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      // Deactivate expired challenges
      await supabase
        .from('challenges')
        .update({ is_active: false })
        .lt('end_date', new Date().toISOString().split('T')[0]);

      console.log('🧹 Old data cleanup completed');
    } catch (error) {
      console.error('❌ Error cleaning up data:', error);
    }
  }
}
