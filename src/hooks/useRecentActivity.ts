
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Activity {
  id: string;
  title: string;
  time: string;
  icon: string;
  color: string;
  bg: string;
  type: string;
  resumoId?: string;
}

export const useRecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRecentActivity = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching recent activity for user:', user.id);
      
      // Buscar uploads recentes
      const { data: uploads } = await supabase
        .from('uploads')
        .select('id, arquivo_original_nome, data_upload')
        .eq('user_id', user.id)
        .order('data_upload', { ascending: false })
        .limit(5);

      // Buscar reviews de flashcards recentes
      const { data: flashcardReviews } = await supabase
        .from('flashcard_reviews')
        .select('id, data_review, flashcard_id')
        .eq('user_id', user.id)
        .order('data_review', { ascending: false })
        .limit(5);

      // Buscar respostas de quiz recentes
      const { data: quizAnswers } = await supabase
        .from('quiz_respostas')
        .select('id, data_resposta, acertou')
        .eq('user_id', user.id)
        .order('data_resposta', { ascending: false })
        .limit(5);

      // Buscar sessões de quiz recentes
      const { data: quizSessions } = await supabase
        .from('quiz_sessions')
        .select('id, created_at, quiz_title, correct_answers, total_questions')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const activityList: Activity[] = [];

      // Adicionar uploads
      uploads?.forEach(upload => {
        activityList.push({
          id: `upload-${upload.id}`,
          title: `Upload: ${upload.arquivo_original_nome}`,
          time: formatTimeAgo(upload.data_upload),
          icon: 'FileText',
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          type: 'upload',
          resumoId: upload.id
        });
      });

      // Adicionar reviews de flashcards
      flashcardReviews?.forEach(review => {
        activityList.push({
          id: `flashcard-${review.id}`,
          title: 'Flashcard revisado',
          time: formatTimeAgo(review.data_review),
          icon: 'Brain',
          color: 'text-green-600',
          bg: 'bg-green-100',
          type: 'flashcard'
        });
      });

      // Adicionar respostas de quiz
      quizAnswers?.forEach(answer => {
        activityList.push({
          id: `quiz-answer-${answer.id}`,
          title: answer.acertou ? 'Quiz: Resposta correta' : 'Quiz: Resposta incorreta',
          time: formatTimeAgo(answer.data_resposta),
          icon: 'Target',
          color: answer.acertou ? 'text-green-600' : 'text-orange-600',
          bg: answer.acertou ? 'bg-green-100' : 'bg-orange-100',
          type: 'quiz'
        });
      });

      // Adicionar sessões de quiz
      quizSessions?.forEach(session => {
        const accuracy = Math.round((session.correct_answers / session.total_questions) * 100);
        activityList.push({
          id: `quiz-session-${session.id}`,
          title: `${session.quiz_title} (${accuracy}% acertos)`,
          time: formatTimeAgo(session.created_at),
          icon: 'Award',
          color: accuracy >= 80 ? 'text-purple-600' : 'text-orange-600',
          bg: accuracy >= 80 ? 'bg-purple-100' : 'bg-orange-100',
          type: 'quiz_session'
        });
      });

      // Ordenar por data e pegar os 8 mais recentes
      activityList.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      
      const finalActivities = activityList.slice(0, 8);
      console.log('✅ Recent activity loaded:', finalActivities.length, 'items');
      setActivities(finalActivities);

    } catch (error) {
      console.error('❌ Error fetching recent activity:', error);
      // Em caso de erro, mantém o array vazio em vez de undefined
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    fetchRecentActivity();
    
    if (user) {
      const channel = supabase
        .channel(`recent_activity_updates-${user.id}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'uploads', filter: `user_id=eq.${user.id}` },
          () => {
            console.log('🔄 Upload change detected, refreshing activity...');
            setTimeout(fetchRecentActivity, 1000);
          }
        )
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'flashcard_reviews', filter: `user_id=eq.${user.id}` },
          () => {
            console.log('🔄 Flashcard review change detected, refreshing activity...');
            setTimeout(fetchRecentActivity, 1000);
          }
        )
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'quiz_respostas', filter: `user_id=eq.${user.id}` },
          () => {
            console.log('🔄 Quiz answer change detected, refreshing activity...');
            setTimeout(fetchRecentActivity, 1000);
          }
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'quiz_sessions', filter: `user_id=eq.${user.id}` },
          () => {
            console.log('🔄 Quiz session change detected, refreshing activity...');
            setTimeout(fetchRecentActivity, 1000);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    activities,
    loading,
    refreshActivity: fetchRecentActivity
  };
};
