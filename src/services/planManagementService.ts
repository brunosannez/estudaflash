
import { supabase } from '@/integrations/supabase/client';
import { PlanType } from '@/types/plans';
import type { User } from '@supabase/supabase-js';

export interface UserWithPlan {
  user_id: string;
  email: string;
  plano: PlanType;
  uploads_realizados: number;
  flashcards_gerados: number;
  quizzes_realizados: number;
  data_ultimo_reset: string;
  created_at: string;
}

export class PlanManagementService {
  static async getAllUsersWithPlans(): Promise<UserWithPlan[]> {
    try {
      // Primeiro buscar os dados de uso
      const { data: usageData, error: usageError } = await supabase
        .from('uso_usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (usageError) {
        console.error('Erro ao buscar dados de uso:', usageError);
        throw usageError;
      }

      // Buscar informações dos usuários
      const { data: authResponse, error: usersError } = await supabase.auth.admin.listUsers();

      if (usersError) {
        console.error('Erro ao buscar usuários:', usersError);
        throw usersError;
      }

      const users: User[] = authResponse.users || [];

      // Combinar os dados
      const usersWithPlans: UserWithPlan[] = usageData?.map(usage => {
        const user = users.find(u => u.id === usage.user_id);
        return {
          user_id: usage.user_id,
          email: user?.email || 'Email não encontrado',
          plano: usage.plano as PlanType,
          uploads_realizados: usage.uploads_realizados,
          flashcards_gerados: usage.flashcards_gerados,
          quizzes_realizados: usage.quizzes_realizados,
          data_ultimo_reset: usage.data_ultimo_reset,
          created_at: usage.created_at,
        };
      }) || [];

      return usersWithPlans;
    } catch (error) {
      console.error('Erro ao buscar usuários com planos:', error);
      throw error;
    }
  }

  static async changeuserPlan(userId: string, newPlan: PlanType): Promise<boolean> {
    try {
      console.log(`Alterando plano do usuário ${userId} para ${newPlan}`);

      const { data, error } = await supabase.rpc('admin_change_user_plan', {
        target_user_id: userId,
        new_plan: newPlan
      });

      if (error) {
        console.error('Erro ao alterar plano:', error);
        throw error;
      }

      console.log('Plano alterado com sucesso:', data);
      return true;
    } catch (error) {
      console.error('Erro no changeuserPlan:', error);
      throw error;
    }
  }
}
