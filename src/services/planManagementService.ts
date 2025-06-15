
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
  last_login?: string;
  storage_mb?: number;
  is_admin?: boolean;
}

export class PlanManagementService {
  static async getAllUsersWithPlans(): Promise<UserWithPlan[]> {
    try {
      // Usar a função RPC que retorna dados completos dos usuários
      const { data: usersData, error } = await supabase.rpc('get_all_users_admin');

      if (error) {
        console.error('Erro ao buscar usuários via RPC:', error);
        throw error;
      }

      if (!usersData || !Array.isArray(usersData)) {
        console.error('Dados de usuários inválidos');
        return [];
      }

      // Mapear os dados para o formato esperado
      const usersWithPlans: UserWithPlan[] = usersData.map(user => ({
        user_id: user.user_id,
        email: user.email || 'Email não encontrado',
        plano: user.plano as PlanType,
        uploads_realizados: user.uploads_realizados || 0,
        flashcards_gerados: user.flashcards_gerados || 0,
        quizzes_realizados: user.quizzes_realizados || 0,
        data_ultimo_reset: user.created_at,
        created_at: user.created_at,
        storage_mb: user.storage_mb || 0,
        is_admin: user.is_admin || false
      }));

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

  static async promoteUserToAdmin(userEmail: string): Promise<boolean> {
    try {
      console.log(`Promovendo usuário ${userEmail} a administrador`);

      const { data, error } = await supabase.rpc('admin_promote_user', {
        target_email: userEmail
      });

      if (error) {
        console.error('Erro ao promover usuário:', error);
        throw error;
      }

      console.log('Usuário promovido com sucesso:', data);
      return true;
    } catch (error) {
      console.error('Erro no promoteUserToAdmin:', error);
      throw error;
    }
  }

  static async resetUserUsage(userId: string): Promise<boolean> {
    try {
      console.log(`Resetando uso do usuário ${userId}`);

      const { data, error } = await supabase.rpc('admin_reset_user_usage', {
        target_user_id: userId
      });

      if (error) {
        console.error('Erro ao resetar uso:', error);
        throw error;
      }

      console.log('Uso resetado com sucesso:', data);
      return true;
    } catch (error) {
      console.error('Erro no resetUserUsage:', error);
      throw error;
    }
  }

  static async deleteUserData(userId: string): Promise<boolean> {
    try {
      console.log(`Deletando dados do usuário ${userId}`);

      const { data, error } = await supabase.rpc('admin_delete_user_data', {
        target_user_id: userId
      });

      if (error) {
        console.error('Erro ao deletar dados do usuário:', error);
        throw error;
      }

      console.log('Dados do usuário deletados com sucesso:', data);
      return true;
    } catch (error) {
      console.error('Erro no deleteUserData:', error);
      throw error;
    }
  }
}
