
import { supabase } from '@/integrations/supabase/client';

export const useRealUserCounts = () => {
  const getRealUserCounts = async (userId: string) => {
    console.log('📊 Contando dados reais para usuário:', userId);

    // Contar uploads com informações de tamanho
    const { data: uploadsData, count: uploadCount, error: uploadError } = await supabase
      .from('uploads')
      .select('id, file_size', { count: 'exact' })
      .eq('user_id', userId);

    if (uploadError) {
      console.error('❌ Erro ao contar uploads:', uploadError);
      throw uploadError;
    }

    // Calcular tamanho total dos arquivos
    const totalStorageBytes = uploadsData?.reduce((total, upload) => total + (upload.file_size || 0), 0) || 0;
    console.log('💾 Total storage calculado:', totalStorageBytes, 'bytes');

    // Contar flashcards gerados
    const { count: flashcardCount, error: flashcardError } = await supabase
      .from('flashcards')
      .select(`
        id,
        resumo_id!inner(
          upload_id!inner(user_id)
        )
      `, { count: 'exact' })
      .eq('resumo_id.upload_id.user_id', userId);

    if (flashcardError) {
      console.error('❌ Erro ao contar flashcards:', flashcardError);
      throw flashcardError;
    }

    // Contar quizzes respondidos
    const { count: quizCount, error: quizError } = await supabase
      .from('quiz_respostas')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (quizError) {
      console.error('❌ Erro ao contar quiz respostas:', quizError);
      throw quizError;
    }

    const counts = {
      uploads: uploadCount || 0,
      flashcards: flashcardCount || 0,
      quizzes: quizCount || 0,
      totalStorageBytes
    };

    console.log('✅ Contagens reais obtidas:', counts);
    return counts;
  };

  return { getRealUserCounts };
};
