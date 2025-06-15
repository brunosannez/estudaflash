import { supabase } from '@/integrations/supabase/client';
import { PlanType } from '@/types/plans';
import { AdminUserService } from './adminUserService';

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
    return await AdminUserService.getAllUsersWithPlans();
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
