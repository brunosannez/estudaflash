
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RecentActivityItem {
  id: string;
  type: 'upload' | 'flashcard' | 'quiz' | 'achievement';
  title: string;
  time: string;
  icon: string;
  color: string;
  bg: string;
}

export const useRecentActivity = () => {
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No user found for recent activity');
        return;
      }

      console.log('🔍 Fetching recent activity for user:', user.id);

      const recentActivities: RecentActivityItem[] = [];

      // Buscar uploads recentes
      try {
        const { data: uploads } = await supabase
          .from('uploads')
          .select('id, data_upload, arquivo_original_nome, texto_extraido')
          .eq('user_id', user.id)
          .order('data_upload', { ascending: false })
          .limit(5);

        uploads?.forEach(upload => {
          const fileName = upload.arquivo_original_nome || 'Arquivo sem nome';
          recentActivities.push({
            id: upload.id,
            type: 'upload',
            title: `📁 Upload: ${fileName}`,
            time: formatTime(upload.data_upload),
            icon: 'FileText',
            color: 'text-blue-600',
            bg: 'bg-blue-100'
          });
        });
        console.log('✅ Uploads loaded:', uploads?.length || 0);
      } catch (error) {
        console.warn('⚠️ Error loading uploads:', error);
      }

      // Buscar atividades de flashcards (últimas revisões)
      try {
        const { data: flashcardReviews } = await supabase
          .from('flashcard_reviews')
          .select(`
            id, 
            data_review, 
            lembrou,
            flashcard_id,
            flashcards(pergunta)
          `)
          .eq('user_id', user.id)
          .order('data_review', { ascending: false })
          .limit(5);

        flashcardReviews?.forEach(review => {
          const result = review.lembrou ? 'lembrou' : 'não lembrou';
          recentActivities.push({
            id: review.id,
            type: 'flashcard',
            title: `🧠 Flashcard: ${result}`,
            time: formatTime(review.data_review),
            icon: 'Brain',
            color: review.lembrou ? 'text-green-600' : 'text-orange-600',
            bg: review.lembrou ? 'bg-green-100' : 'bg-orange-100'
          });
        });
        console.log('✅ Flashcard reviews loaded:', flashcardReviews?.length || 0);
      } catch (error) {
        console.warn('⚠️ Error loading flashcard reviews:', error);
      }

      // Buscar respostas de quiz recentes
      try {
        const { data: quizAnswers } = await supabase
          .from('quiz_respostas')
          .select(`
            id, 
            data_resposta, 
            acertou, 
            quiz_id,
            quizzes(pergunta)
          `)
          .eq('user_id', user.id)
          .order('data_resposta', { ascending: false })
          .limit(5);

        quizAnswers?.forEach(answer => {
          recentActivities.push({
            id: answer.id,
            type: 'quiz',
            title: `🎯 Quiz: ${answer.acertou ? 'Correto!' : 'Incorreto'}`,
            time: formatTime(answer.data_resposta),
            icon: 'Target',
            color: answer.acertou ? 'text-green-600' : 'text-red-600',
            bg: answer.acertou ? 'bg-green-100' : 'bg-red-100'
          });
        });
        console.log('✅ Quiz answers loaded:', quizAnswers?.length || 0);
      } catch (error) {
        console.warn('⚠️ Error loading quiz answers:', error);
      }

      // Buscar sessões de quiz completas
      try {
        const { data: quizSessions } = await supabase
          .from('quiz_sessions')
          .select('id, created_at, quiz_title, correct_answers, total_questions')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        quizSessions?.forEach(session => {
          const accuracy = Math.round((session.correct_answers / session.total_questions) * 100);
          recentActivities.push({
            id: session.id,
            type: 'achievement',
            title: `🏆 Quiz Completo: ${accuracy}% de acerto`,
            time: formatTime(session.created_at),
            icon: 'Award',
            color: accuracy >= 80 ? 'text-purple-600' : 'text-blue-600',
            bg: accuracy >= 80 ? 'bg-purple-100' : 'bg-blue-100'
          });
        });
        console.log('✅ Quiz sessions loaded:', quizSessions?.length || 0);
      } catch (error) {
        console.warn('⚠️ Error loading quiz sessions:', error);
      }

      // Ordenar por tempo e pegar apenas os 8 mais recentes
      const sortedActivities = recentActivities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 8);

      console.log('📊 Total activities found:', sortedActivities.length);
      setActivities(sortedActivities);

    } catch (error) {
      console.error('❌ Critical error fetching recent activity:', error);
      toast({
        title: "Erro Temporário",
        description: "Não foi possível carregar atividades recentes.",
        variant: "destructive",
      });
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffMinutes = Math.ceil(diffTime / (1000 * 60));
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffMinutes < 60) {
        return `${diffMinutes} min atrás`;
      } else if (diffHours < 24) {
        return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
      } else {
        return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
      }
    } catch (error) {
      console.warn('⚠️ Error formatting time:', error);
      return 'Recentemente';
    }
  };

  useEffect(() => {
    fetchRecentActivity();
    
    // Refresh automático a cada 60 segundos
    const interval = setInterval(fetchRecentActivity, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    activities,
    loading,
    fetchRecentActivity
  };
};
