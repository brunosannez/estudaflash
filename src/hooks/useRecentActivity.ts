
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
      if (!user) return;

      console.log('Fetching recent activity for user:', user.id);

      // Buscar uploads recentes
      const { data: uploads } = await supabase
        .from('uploads')
        .select('id, data_upload, texto_extraido')
        .eq('user_id', user.id)
        .order('data_upload', { ascending: false })
        .limit(3);

      // Buscar atividades de flashcards (últimas revisões)
      const { data: flashcardReviews } = await supabase
        .from('flashcard_reviews')
        .select('id, data_review, flashcard_id, flashcards(pergunta)')
        .eq('user_id', user.id)
        .order('data_review', { ascending: false })
        .limit(3);

      // Buscar respostas de quiz recentes
      const { data: quizAnswers } = await supabase
        .from('quiz_respostas')
        .select('id, data_resposta, acertou, quiz_id, quizzes(pergunta)')
        .eq('user_id', user.id)
        .order('data_resposta', { ascending: false })
        .limit(3);

      const recentActivities: RecentActivityItem[] = [];

      // Adicionar uploads
      uploads?.forEach(upload => {
        const extractedWords = upload.texto_extraido?.split(' ').slice(0, 5).join(' ') || 'Sem texto';
        recentActivities.push({
          id: upload.id,
          type: 'upload',
          title: `Upload: ${extractedWords}...`,
          time: formatTime(upload.data_upload),
          icon: 'FileText',
          color: 'text-blue-600',
          bg: 'bg-blue-100'
        });
      });

      // Adicionar revisões de flashcards
      flashcardReviews?.forEach(review => {
        recentActivities.push({
          id: review.id,
          type: 'flashcard',
          title: `Flashcard revisado`,
          time: formatTime(review.data_review),
          icon: 'Brain',
          color: 'text-purple-600',
          bg: 'bg-purple-100'
        });
      });

      // Adicionar respostas de quiz
      quizAnswers?.forEach(answer => {
        recentActivities.push({
          id: answer.id,
          type: 'quiz',
          title: `Quiz ${answer.acertou ? 'correto' : 'incorreto'}`,
          time: formatTime(answer.data_resposta),
          icon: 'Target',
          color: answer.acertou ? 'text-green-600' : 'text-red-600',
          bg: answer.acertou ? 'bg-green-100' : 'bg-red-100'
        });
      });

      // Ordenar por tempo e pegar apenas os 5 mais recentes
      const sortedActivities = recentActivities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);

      setActivities(sortedActivities);

    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as atividades recentes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    } else {
      return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
    }
  };

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  return {
    activities,
    loading,
    fetchRecentActivity
  };
};
