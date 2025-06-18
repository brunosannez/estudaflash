
import { supabase } from '@/integrations/supabase/client';

export interface UsageData {
  id: string;
  user_id: string;
  uploads_realizados: number;
  flashcards_gerados: number;
  quizzes_realizados: number;
  data_ultimo_reset: string;
  plano: string;
  plan_id: string;
  plan_name?: string;
  uploads_limit?: number;
  summaries_limit?: number;
  flashcards_limit?: number;
  quizzes_limit?: number;
  quiz_model?: string;
  summary_model?: string;
  flashcard_model?: string;
}

export class UsageDataService {
  static async getUserUsage(userId: string): Promise<UsageData | null> {
    try {
      console.log('🔍 Buscando dados de uso para usuário:', userId);
      
      const { data, error } = await supabase
        .from('uso_usuarios')
        .select(`
          *,
          plans:plan_id (
            name,
            uploads_limit,
            summaries_limit,
            flashcards_limit,
            quizzes_limit,
            quiz_model,
            summary_model,
            flashcard_model
          )
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar dados de uso:', error);
        throw error;
      }

      if (!data) {
        console.log('📝 Usuário não encontrado, inicializando...');
        return await this.initializeUserUsage(userId);
      }

      console.log('✅ Dados de uso encontrados:', data);
      
      const planData = data.plans as any;
      return {
        ...data,
        plano: planData?.name?.toLowerCase() || 'free',
        plan_name: planData?.name,
        uploads_limit: planData?.uploads_limit || 10,
        summaries_limit: planData?.summaries_limit || 10,
        flashcards_limit: planData?.flashcards_limit || 10,
        quizzes_limit: planData?.quizzes_limit || 10,
        quiz_model: planData?.quiz_model,
        summary_model: planData?.summary_model,
        flashcard_model: planData?.flashcard_model,
      };
    } catch (error) {
      console.error('❌ Erro no getUserUsage:', error);
      throw error;
    }
  }

  static async initializeUserUsage(userId: string): Promise<UsageData> {
    try {
      console.log('📝 Inicializando dados de uso para:', userId);
      
      const { data: freePlan } = await supabase
        .from('plans')
        .select('id')
        .eq('name', 'Free')
        .eq('is_active', true)
        .single();

      if (!freePlan) {
        throw new Error('Plano Free não encontrado');
      }

      const { data, error } = await supabase
        .from('uso_usuarios')
        .insert({
          user_id: userId,
          uploads_realizados: 0,
          flashcards_gerados: 0,
          quizzes_realizados: 0,
          plan_id: freePlan.id,
          plano: 'free'
        })
        .select(`
          *,
          plans:plan_id (
            name,
            uploads_limit,
            summaries_limit,
            flashcards_limit,
            quizzes_limit,
            quiz_model,
            summary_model,
            flashcard_model
          )
        `)
        .single();

      if (error) {
        console.error('❌ Erro ao inicializar uso do usuário:', error);
        throw error;
      }

      console.log('✅ Registro de uso inicializado:', data);
      
      const planData = data.plans as any;
      return {
        ...data,
        plano: planData?.name?.toLowerCase() || 'free',
        plan_name: planData?.name,
        uploads_limit: planData?.uploads_limit || 10,
        summaries_limit: planData?.summaries_limit || 10,
        flashcards_limit: planData?.flashcards_limit || 10,
        quizzes_limit: planData?.quizzes_limit || 10,
        quiz_model: planData?.quiz_model,
        summary_model: planData?.summary_model,
        flashcard_model: planData?.flashcard_model,
      };
    } catch (error) {
      console.error('❌ Erro no initializeUserUsage:', error);
      throw error;
    }
  }
}
