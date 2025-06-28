
import { supabase } from '@/integrations/supabase/client';

export interface UsageData {
  user_id: string;
  uploads_realizados: number;
  flashcards_gerados: number;
  quizzes_realizados: number;
  plano: string;
  plan_name?: string;
  uploads_limit: number;
  summaries_limit: number;
  flashcards_limit: number;
  quizzes_limit: number;
  is_admin: boolean;
  data_ultimo_reset: string;
  created_at: string;
  updated_at: string;
}

export class UsageDataService {
  static async getUserUsage(userId: string): Promise<UsageData | null> {
    try {
      console.log('🔍 Fetching user usage for:', userId);
      
      const { data, error } = await supabase
        .from('uso_usuarios')
        .select(`
          *,
          plans!inner(
            name,
            uploads_limit,
            summaries_limit,
            flashcards_limit,
            quizzes_limit
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching user usage:', error);
        
        // Se usuário não existe, tentar criar
        if (error.code === 'PGRST116') {
          return await this.initializeUserUsage(userId);
        }
        throw error;
      }

      console.log('✅ User usage fetched:', data);
      
      // Mapear dados do plano
      const planData = Array.isArray(data.plans) ? data.plans[0] : data.plans;
      
      return {
        user_id: data.user_id,
        uploads_realizados: data.uploads_realizados,
        flashcards_gerados: data.flashcards_gerados,
        quizzes_realizados: data.quizzes_realizados,
        plano: data.plano,
        plan_name: planData?.name || data.plano,
        uploads_limit: planData?.uploads_limit || 10,
        summaries_limit: planData?.summaries_limit || 10,
        flashcards_limit: planData?.flashcards_limit || 10,
        quizzes_limit: planData?.quizzes_limit || 10,
        is_admin: data.is_admin,
        data_ultimo_reset: data.data_ultimo_reset,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('❌ Error in getUserUsage:', error);
      throw error;
    }
  }

  static async initializeUserUsage(userId: string): Promise<UsageData | null> {
    try {
      console.log('🔄 Initializing user usage for:', userId);
      
      // Buscar plano Free padrão
      const { data: freePlan } = await supabase
        .from('plans')
        .select('*')
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
          plan_id: freePlan.id,
          plano: 'free',
          uploads_realizados: 0,
          flashcards_gerados: 0,
          quizzes_realizados: 0,
          is_admin: false
        })
        .select(`
          *,
          plans!inner(
            name,
            uploads_limit,
            summaries_limit,
            flashcards_limit,
            quizzes_limit
          )
        `)
        .single();

      if (error) {
        console.error('❌ Error initializing user usage:', error);
        throw error;
      }

      console.log('✅ User usage initialized:', data);
      
      const planData = Array.isArray(data.plans) ? data.plans[0] : data.plans;
      
      return {
        user_id: data.user_id,
        uploads_realizados: data.uploads_realizados,
        flashcards_gerados: data.flashcards_gerados,
        quizzes_realizados: data.quizzes_realizados,
        plano: data.plano,
        plan_name: planData?.name || data.plano,
        uploads_limit: planData?.uploads_limit || 10,
        summaries_limit: planData?.summaries_limit || 10,
        flashcards_limit: planData?.flashcards_limit || 10,
        quizzes_limit: planData?.quizzes_limit || 10,
        is_admin: data.is_admin,
        data_ultimo_reset: data.data_ultimo_reset,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('❌ Error initializing user usage:', error);
      throw error;
    }
  }
}
