
import { supabase } from '@/integrations/supabase/client';
import { PlanType } from '@/types/plans';

export interface UsageData {
  id: string;
  user_id: string;
  uploads_realizados: number;
  flashcards_gerados: number;
  quizzes_realizados: number;
  data_ultimo_reset: string;
  plano: PlanType;
}

export class UsageDataService {
  static async getUserUsage(userId: string): Promise<UsageData | null> {
    try {
      console.log('🔍 Buscando dados de uso para usuário:', userId);
      
      const { data, error } = await supabase
        .from('uso_usuarios')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar dados de uso:', error);
        throw error;
      }

      if (!data) {
        console.log('📝 Criando registro inicial de uso para usuário:', userId);
        return await this.initializeUserUsage(userId);
      }

      console.log('✅ Dados de uso encontrados:', data);
      return {
        ...data,
        plano: data.plano as PlanType
      };
    } catch (error) {
      console.error('❌ Erro no getUserUsage:', error);
      throw error;
    }
  }

  static async initializeUserUsage(userId: string): Promise<UsageData> {
    try {
      const { data, error } = await supabase
        .from('uso_usuarios')
        .insert({
          user_id: userId,
          uploads_realizados: 0,
          flashcards_gerados: 0,
          quizzes_realizados: 0,
          plano: 'free',
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao inicializar uso do usuário:', error);
        throw error;
      }

      console.log('✅ Registro de uso inicializado:', data);
      return {
        ...data,
        plano: data.plano as PlanType
      };
    } catch (error) {
      console.error('❌ Erro no initializeUserUsage:', error);
      throw error;
    }
  }
}
