import { supabase } from '@/integrations/supabase/client';

export class DataSeederService {
  private static hasSeeded = false;

  static async seedInitialData() {
    if (this.hasSeeded) return;

    try {
      console.log('🌱 Starting data seeding...');

      // Verificar se já existem dados
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
        await this.seedLeaderboards();
      }

      await this.seedSampleActivities();

      this.hasSeeded = true;
      console.log('✅ Data seeding completed');
    } catch (error) {
      console.error('❌ Error seeding data:', error);
    }
  }

  private static async seedChallenges() {
    const challenges = [
      {
        title: 'Quiz Master',
        description: 'Complete 10 quizzes com pelo menos 80% de acerto',
        type: 'weekly',
        category: 'quiz',
        target_value: 10,
        xp_reward: 500,
        badge_reward: '🏆 Quiz Master',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true
      },
      {
        title: 'Flashcard Hero',
        description: 'Revise 50 flashcards esta semana',
        type: 'weekly',
        category: 'flashcards',
        target_value: 50,
        xp_reward: 300,
        badge_reward: '🧠 Flashcard Hero',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true
      },
      {
        title: 'Streak Warrior',
        description: 'Mantenha uma sequência de 7 dias consecutivos estudando',
        type: 'weekly',
        category: 'streak',
        target_value: 7,
        xp_reward: 750,
        badge_reward: '🔥 Streak Warrior',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_active: true
      },
      {
        title: 'XP Collector',
        description: 'Acumule 1000 pontos de experiência neste mês',
        type: 'monthly',
        category: 'xp',
        target_value: 1000,
        xp_reward: 1000,
        badge_reward: '💎 XP Collector',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

    if (error) throw error;
    console.log('📝 Challenges seeded');
  }

  private static async seedLeaderboards() {
    // Buscar usuários existentes
    const { data: users } = await supabase
      .from('uso_usuarios')
      .select('user_id')
      .limit(10);

    if (!users || users.length === 0) return;

    const leaderboardEntries = [];
    const categories = ['xp', 'flashcards', 'quiz', 'streak'];
    const periods = ['daily', 'weekly', 'monthly', 'all_time'];

    for (const category of categories) {
      for (const period of periods) {
        const periodStart = new Date();
        const periodEnd = new Date();

        switch (period) {
          case 'daily':
            // Hoje
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

        users.forEach((user, index) => {
          leaderboardEntries.push({
            user_id: user.user_id,
            period_type: period,
            category: category,
            value: Math.floor(Math.random() * 1000) + 100,
            rank_position: index + 1,
            period_start: periodStart.toISOString().split('T')[0],
            period_end: periodEnd.toISOString().split('T')[0]
          });
        });
      }
    }

    const { error } = await supabase
      .from('leaderboards')
      .insert(leaderboardEntries);

    if (error) throw error;
    console.log('🏆 Leaderboards seeded');
  }

  private static async seedSampleActivities() {
    const { data: users } = await supabase
      .from('uso_usuarios')
      .select('user_id')
      .limit(5);

    if (!users || users.length === 0) return;

    const activities = [
      {
        user_id: users[0]?.user_id,
        activity_type: 'level_up',
        title: 'Subiu para o nível 3!',
        description: 'Alcançou 300 pontos de XP',
        metadata: { level: 3, xp: 300 },
        is_public: true
      },
      {
        user_id: users[1]?.user_id,
        activity_type: 'badge_earned',
        title: 'Conquistou um novo badge!',
        description: 'Quiz Master - 10 quizzes completados',
        metadata: { badge: 'Quiz Master', type: 'quiz' },
        is_public: true
      },
      {
        user_id: users[2]?.user_id,
        activity_type: 'streak_milestone',
        title: 'Sequência de 7 dias!',
        description: 'Manteve consistência por uma semana inteira',
        metadata: { streak: 7 },
        is_public: true
      },
      {
        user_id: users[0]?.user_id,
        activity_type: 'quiz_perfect',
        title: 'Quiz perfeito!',
        description: 'Acertou 100% das questões em Matemática',
        metadata: { accuracy: 100, subject: 'Matemática' },
        is_public: true
      }
    ].filter(activity => activity.user_id); // Remove atividades sem user_id

    if (activities.length > 0) {
      const { error } = await supabase
        .from('social_activities')
        .insert(activities);

      if (error) console.warn('Warning: Could not seed activities:', error);
      else console.log('📱 Sample activities seeded');
    }
  }

  static async seedUserInitialData(userId: string) {
    try {
      // Criar progresso inicial se não existir
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

      // Criar atividade diária se não existir
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

      // Limpar atividades sociais antigas
      await supabase
        .from('social_activities')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());

      // Limpar desafios expirados
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