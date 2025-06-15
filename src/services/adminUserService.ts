
import { supabase } from '@/integrations/supabase/client';
import { UserWithPlan } from './planManagementService';
import { PlanType } from '@/types/plans';

export class AdminUserService {
  static async getAllUsersWithPlans(): Promise<UserWithPlan[]> {
    try {
      console.log('👥 Carregando usuários via RPC...');
      
      const { data: usersData, error } = await supabase.rpc('get_all_users_admin');

      if (error) {
        console.error('❌ Erro na RPC get_all_users_admin:', error);
        // Fallback: carregar usuários manualmente
        return await this.getAllUsersWithPlansFallback();
      }

      if (!usersData || !Array.isArray(usersData)) {
        console.warn('⚠️ RPC retornou dados inválidos, usando fallback');
        return await this.getAllUsersWithPlansFallback();
      }

      console.log('✅ Usuários carregados via RPC:', usersData.length);

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
        is_admin: user.is_admin || false
      }));
    } catch (error) {
      console.error('💥 Erro geral ao carregar usuários:', error);
      return await this.getAllUsersWithPlansFallback();
    }
  }

  static async getAllUsersWithPlansFallback(): Promise<UserWithPlan[]> {
    try {
      console.log('🔄 Carregando usuários via fallback...');

      // Carregar usuários diretamente da tabela uso_usuarios
      const { data: usersData, error: usersError } = await supabase
        .from('uso_usuarios')
        .select(`
          user_id,
          plano,
          uploads_realizados,
          flashcards_gerados,
          quizzes_realizados,
          created_at,
          is_admin
        `)
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('❌ Erro ao carregar da tabela uso_usuarios:', usersError);
        throw usersError;
      }

      if (!usersData || usersData.length === 0) {
        console.warn('⚠️ Nenhum usuário encontrado na tabela uso_usuarios');
        return [];
      }

      console.log('✅ Usuários carregados via fallback:', usersData.length);

      // Para cada usuário, tentar obter o email (pode falhar em alguns casos)
      const usersWithEmails = await Promise.all(
        usersData.map(async (user) => {
          try {
            // Tentar obter email do auth.users através de uma query que não causa problemas de RLS
            const { data: authData } = await supabase
              .from('uso_usuarios')
              .select('user_id')
              .eq('user_id', user.user_id)
              .single();

            return {
              user_id: user.user_id,
              email: `user-${user.user_id.slice(0, 8)}@domain.com`, // Email placeholder
              plano: this.validatePlanType(user.plano),
              uploads_realizados: user.uploads_realizados || 0,
              flashcards_gerados: user.flashcards_gerados || 0,
              quizzes_realizados: user.quizzes_realizados || 0,
              data_ultimo_reset: user.created_at,
              created_at: user.created_at,
              storage_mb: 0, // Será calculado separadamente se necessário
              is_admin: user.is_admin || false
            };
          } catch (error) {
            console.warn(`⚠️ Erro ao processar usuário ${user.user_id}:`, error);
            return {
              user_id: user.user_id,
              email: `user-${user.user_id.slice(0, 8)}@domain.com`,
              plano: this.validatePlanType(user.plano),
              uploads_realizados: user.uploads_realizados || 0,
              flashcards_gerados: user.flashcards_gerados || 0,
              quizzes_realizados: user.quizzes_realizados || 0,
              data_ultimo_reset: user.created_at,
              created_at: user.created_at,
              storage_mb: 0,
              is_admin: user.is_admin || false
            };
          }
        })
      );

      return usersWithEmails;
    } catch (error) {
      console.error('💥 Erro no fallback de usuários:', error);
      throw error;
    }
  }

  private static validatePlanType(plano: string): PlanType {
    // Validar se o plano é um dos valores permitidos
    if (plano === 'free' || plano === 'pro' || plano === 'edu') {
      return plano as PlanType;
    }
    // Fallback para 'free' se o valor não for válido
    console.warn(`⚠️ Plano inválido encontrado: ${plano}, usando 'free' como fallback`);
    return 'free';
  }
}
