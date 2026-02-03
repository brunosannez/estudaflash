import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const deleteService = {
  /**
   * Deleta um resumo e todos os dados relacionados (flashcards, quizzes, mapa mental)
   */
  async deleteResumo(resumoId: string): Promise<boolean> {
    try {
      console.log('🗑️ Iniciando exclusão do resumo:', resumoId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return false;
      }

      // 1. Deletar flashcards relacionados
      const { error: flashcardsError } = await supabase
        .from('flashcards')
        .delete()
        .eq('resumo_id', resumoId);

      if (flashcardsError) {
        console.error('Erro ao deletar flashcards:', flashcardsError);
      }

      // 2. Deletar mapas mentais relacionados
      const { error: mindMapsError } = await supabase
        .from('mind_maps')
        .delete()
        .eq('resumo_id', resumoId);

      if (mindMapsError) {
        console.error('Erro ao deletar mapas mentais:', mindMapsError);
      }

      // 3. Buscar e deletar quizzes ENEM relacionados
      const { data: quizMetadata } = await supabase
        .from('enem_quiz_metadata')
        .select('id')
        .eq('resumo_id', resumoId);

      if (quizMetadata && quizMetadata.length > 0) {
        const metadataIds = quizMetadata.map(q => q.id);
        
        // Deletar sessões de quiz
        const { error: sessionsError } = await supabase
          .from('enem_quiz_sessions')
          .delete()
          .in('quiz_metadata_id', metadataIds);
          
        if (sessionsError) {
          console.error('Erro ao deletar sessões de quiz:', sessionsError);
        }

        // Deletar questões
        const { error: questionsError } = await supabase
          .from('enem_questions')
          .delete()
          .in('quiz_metadata_id', metadataIds);
          
        if (questionsError) {
          console.error('Erro ao deletar questões:', questionsError);
        }

        // Deletar metadata
        const { error: metadataError } = await supabase
          .from('enem_quiz_metadata')
          .delete()
          .eq('resumo_id', resumoId);
          
        if (metadataError) {
          console.error('Erro ao deletar metadata do quiz:', metadataError);
        }
      }

      // 4. Buscar o upload_id do resumo
      const { data: resumo } = await supabase
        .from('resumos')
        .select('upload_id')
        .eq('id', resumoId)
        .single();

      // 5. Deletar o resumo
      const { error: resumoError } = await supabase
        .from('resumos')
        .delete()
        .eq('id', resumoId);

      if (resumoError) {
        console.error('Erro ao deletar resumo:', resumoError);
        throw resumoError;
      }

      // 6. Deletar o upload (opcional, só se não tiver outros resumos)
      if (resumo?.upload_id) {
        const { error: uploadError } = await supabase
          .from('uploads')
          .delete()
          .eq('id', resumo.upload_id)
          .eq('user_id', user.id);
          
        if (uploadError) {
          console.warn('Não foi possível deletar upload:', uploadError);
        }
      }

      console.log('✅ Resumo e dados relacionados deletados com sucesso');
      toast.success('Resumo deletado com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao deletar resumo:', error);
      toast.error('Erro ao deletar resumo');
      return false;
    }
  },

  /**
   * Deleta todos os flashcards de um resumo específico
   */
  async deleteFlashcardSet(resumoId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deletando flashcards do resumo:', resumoId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return false;
      }

      // Verificar se o resumo pertence ao usuário
      const { data: resumo } = await supabase
        .from('resumos')
        .select('id, uploads!inner(user_id)')
        .eq('id', resumoId)
        .single();

      if (!resumo) {
        toast.error('Resumo não encontrado');
        return false;
      }

      // Deletar flashcards
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('resumo_id', resumoId);

      if (error) {
        console.error('Erro ao deletar flashcards:', error);
        throw error;
      }

      console.log('✅ Flashcards deletados com sucesso');
      toast.success('Flashcards deletados com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao deletar flashcards:', error);
      toast.error('Erro ao deletar flashcards');
      return false;
    }
  },

  /**
   * Deleta um quiz ENEM específico (metadata, questões e sessões)
   */
  async deleteQuiz(quizMetadataId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deletando quiz ENEM:', quizMetadataId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return false;
      }

      // 1. Buscar sessões do quiz para deletar respostas
      const { data: sessions } = await supabase
        .from('enem_quiz_sessions')
        .select('id')
        .eq('quiz_metadata_id', quizMetadataId)
        .eq('user_id', user.id);

      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map(s => s.id);
        
        // Deletar respostas do usuário
        const { error: answersError } = await supabase
          .from('enem_user_answers')
          .delete()
          .in('session_id', sessionIds);
          
        if (answersError) {
          console.error('Erro ao deletar respostas:', answersError);
        }
      }

      // 2. Deletar sessões de quiz do usuário
      const { error: sessionsError } = await supabase
        .from('enem_quiz_sessions')
        .delete()
        .eq('quiz_metadata_id', quizMetadataId)
        .eq('user_id', user.id);

      if (sessionsError) {
        console.error('Erro ao deletar sessões:', sessionsError);
      }

      // 3. Deletar questões
      const { error: questionsError } = await supabase
        .from('enem_questions')
        .delete()
        .eq('quiz_metadata_id', quizMetadataId);

      if (questionsError) {
        console.error('Erro ao deletar questões:', questionsError);
      }

      // 4. Deletar metadata do quiz
      const { error: metadataError } = await supabase
        .from('enem_quiz_metadata')
        .delete()
        .eq('id', quizMetadataId);

      if (metadataError) {
        console.error('Erro ao deletar metadata:', metadataError);
        throw metadataError;
      }

      console.log('✅ Quiz ENEM deletado com sucesso');
      toast.success('Quiz deletado com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao deletar quiz:', error);
      toast.error('Erro ao deletar quiz');
      return false;
    }
  }
};
