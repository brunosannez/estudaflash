
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticsResult {
  isAdmin: boolean;
  adminCheckMethod: string;
  userRecord: any;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class AdminDiagnosticsService {
  static async runDiagnostics(): Promise<DiagnosticsResult> {
    const result: DiagnosticsResult = {
      isAdmin: false,
      adminCheckMethod: 'none',
      userRecord: null,
      errors: [],
      warnings: [],
      suggestions: []
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        result.errors.push('Usuário não autenticado');
        return result;
      }

      console.log('🔍 Executando diagnósticos para usuário:', user.id);

      // 1. Verificar na tabela uso_usuarios
      const { data: usageUser, error: usageError } = await supabase
        .from('uso_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (usageError) {
        result.errors.push(`Erro ao buscar uso_usuarios: ${usageError.message}`);
      } else if (usageUser) {
        result.userRecord = usageUser;
        if (usageUser.is_admin) {
          result.isAdmin = true;
          result.adminCheckMethod = 'uso_usuarios.is_admin';
        }
      } else {
        result.warnings.push('Usuário não encontrado na tabela uso_usuarios');
        result.suggestions.push('Executar sincronização de dados do usuário');
      }

      // 2. Verificar na tabela admin_users
      if (!result.isAdmin) {
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (adminError) {
          result.errors.push(`Erro ao buscar admin_users: ${adminError.message}`);
        } else if (adminUser) {
          result.isAdmin = true;
          result.adminCheckMethod = 'admin_users table';
          
          // Sincronizar com uso_usuarios se necessário
          if (usageUser && !usageUser.is_admin) {
            result.suggestions.push('Sincronizar status de admin entre tabelas');
          }
        }
      }

      // 3. Verificar função RPC
      if (!result.isAdmin) {
        try {
          const { data: rpcResult, error: rpcError } = await supabase.rpc('is_current_user_admin');
          
          if (rpcError) {
            result.errors.push(`Erro na função RPC: ${rpcError.message}`);
          } else if (rpcResult) {
            result.isAdmin = true;
            result.adminCheckMethod = 'RPC is_current_user_admin';
          }
        } catch (error) {
          result.errors.push(`Erro ao executar RPC: ${error}`);
        }
      }

      // 4. Verificações adicionais
      if (user.email) {
        const adminEmails = [
          'admin@studyai.com',
          'gabriel@studyai.com',
          'suporte@studyai.com'
        ];
        
        if (adminEmails.includes(user.email.toLowerCase())) {
          result.suggestions.push(`Email ${user.email} deveria ser admin automático`);
        }
      }

      console.log('📊 Diagnósticos completos:', result);
      return result;

    } catch (error) {
      result.errors.push(`Erro geral nos diagnósticos: ${error}`);
      return result;
    }
  }

  static async ensureUserIsAdmin(userId: string): Promise<boolean> {
    try {
      console.log('🔧 Promovendo usuário a admin:', userId);

      // 1. Atualizar uso_usuarios
      const { error: usageError } = await supabase
        .from('uso_usuarios')
        .update({ is_admin: true })
        .eq('user_id', userId);

      if (usageError) {
        console.error('❌ Erro ao atualizar uso_usuarios:', usageError);
        return false;
      }

      // 2. Buscar email do usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        console.error('❌ Email do usuário não disponível');
        return false;
      }

      // 3. Inserir em admin_users
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          email: user.email
        })
        .onConflict('email')
        .ignoreDuplicates();

      if (adminError) {
        console.error('❌ Erro ao inserir em admin_users:', adminError);
        // Não falhar se já existir
      }

      console.log('✅ Usuário promovido a admin com sucesso');
      return true;

    } catch (error) {
      console.error('❌ Erro ao promover usuário:', error);
      return false;
    }
  }
}
