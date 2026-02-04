
import { supabase } from '@/integrations/supabase/client';
import { PlanType } from '@/types/plans';

export interface UserWithPlan {
  user_id: string;
  email: string;
  plano: PlanType;
  uploads_realizados: number;
  flashcards_gerados: number;
  quizzes_realizados: number;
  data_ultimo_reset: string;
  created_at: string;
  storage_mb: number;
  is_admin: boolean;
  is_active: boolean;
  blocked_reason: string | null;
  blocked_at: string | null;
}

export class AdminUserService {
  static async getAllUsersWithPlans(): Promise<UserWithPlan[]> {
    try {
      console.log('🔍 Carregando usuários via função Supabase...');
      
      const { data: usersData, error } = await supabase.rpc('get_all_users_admin');

      if (error) {
        console.error('❌ Erro na função get_all_users_admin:', error);
        throw new Error(`Erro ao carregar usuários: ${error.message}`);
      }

      if (!usersData || !Array.isArray(usersData)) {
        console.warn('⚠️ Função retornou dados inválidos');
        return [];
      }

      console.log('✅ Usuários carregados com sucesso:', usersData.length);

      return usersData.map(user => ({
        user_id: user.user_id,
        email: user.email || 'Email não disponível',
        plano: this.validatePlanType(user.plano),
        uploads_realizados: user.uploads_realizados || 0,
        flashcards_gerados: user.flashcards_gerados || 0,
        quizzes_realizados: user.quizzes_realizados || 0,
        data_ultimo_reset: user.created_at,
        created_at: user.created_at,
        storage_mb: Number(user.storage_mb) || 0,
        is_admin: user.is_admin || false,
        is_active: user.is_active !== false, // Default to true if not set
        blocked_reason: user.blocked_reason || null,
        blocked_at: user.blocked_at || null
      }));
    } catch (error) {
      console.error('💥 Erro ao carregar usuários:', error);
      throw error;
    }
  }

  static async changeUserPlan(userId: string, newPlanId: string): Promise<boolean> {
    try {
      console.log('📝 Alterando plano do usuário:', userId, 'para:', newPlanId);
      
      const { error } = await supabase.rpc('admin_change_user_plan_new', {
        target_user_id: userId,
        new_plan_id: newPlanId
      });

      if (error) {
        console.error('❌ Erro ao alterar plano:', error);
        throw error;
      }

      console.log('✅ Plano alterado com sucesso');
      return true;
    } catch (error) {
      console.error('💥 Erro ao alterar plano:', error);
      throw error;
    }
  }

  static async toggleUserStatus(userId: string, isActive: boolean): Promise<boolean> {
    try {
      console.log('🔄 Alterando status do usuário:', userId, 'para:', isActive);
      
      const { error } = await supabase.rpc('admin_toggle_user_status', {
        target_user_id: userId,
        new_is_active: isActive
      });

      if (error) {
        console.error('❌ Erro ao alterar status:', error);
        throw error;
      }

      console.log('✅ Status alterado com sucesso');
      return true;
    } catch (error) {
      console.error('💥 Erro ao alterar status:', error);
      throw error;
    }
  }

  static async blockUser(userId: string, reason: string): Promise<boolean> {
    try {
      console.log('🚫 Bloqueando usuário:', userId, 'motivo:', reason);
      
      const { error } = await supabase.rpc('admin_block_user', {
        target_user_id: userId,
        block_reason: reason
      });

      if (error) {
        console.error('❌ Erro ao bloquear usuário:', error);
        throw error;
      }

      console.log('✅ Usuário bloqueado com sucesso');
      return true;
    } catch (error) {
      console.error('💥 Erro ao bloquear usuário:', error);
      throw error;
    }
  }

  static async unblockUser(userId: string): Promise<boolean> {
    try {
      console.log('✅ Desbloqueando usuário:', userId);
      
      const { error } = await supabase.rpc('admin_unblock_user', {
        target_user_id: userId
      });

      if (error) {
        console.error('❌ Erro ao desbloquear usuário:', error);
        throw error;
      }

      console.log('✅ Usuário desbloqueado com sucesso');
      return true;
    } catch (error) {
      console.error('💥 Erro ao desbloquear usuário:', error);
      throw error;
    }
  }

  private static validatePlanType(plano: string): PlanType {
    if (plano === 'free' || plano === 'pro' || plano === 'edu') {
      return plano as PlanType;
    }
    console.warn(`⚠️ Plano inválido encontrado: ${plano}, usando 'free' como fallback`);
    return 'free';
  }
}
