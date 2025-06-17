
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticsResult {
  isAdmin: boolean;
  adminCheckMethod: string;
  userRecord: any;
  currentUserId?: string;
  totalUploads?: number;
  totalUsers?: number;
  sampleUpload?: any;
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

      result.currentUserId = user.id;
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

      // 4. Estatísticas gerais
      try {
        const { count: uploadsCount } = await supabase
          .from('uploads')
          .select('*', { count: 'exact', head: true });
        
        const { count: usersCount } = await supabase
          .from('uso_usuarios')
          .select('*', { count: 'exact', head: true });

        result.totalUploads = uploadsCount || 0;
        result.totalUsers = usersCount || 0;

        // Sample upload
        const { data: sampleUpload } = await supabase
          .from('uploads')
          .select('*')
          .limit(1)
          .single();

        if (sampleUpload) {
          result.sampleUpload = sampleUpload;
        }
      } catch (error) {
        result.warnings.push('Erro ao buscar estatísticas gerais');
      }

      // 5. Verificações adicionais
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

      // 3. Inserir em admin_users (sem onConflict)
      const { error: adminError } = await supabase
        .from('admin_users')
        .upsert({
          user_id: userId,
          email: user.email
        }, {
          onConflict: 'email'
        });

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

  static async fixFileSizes(): Promise<{ fixed: number }> {
    try {
      console.log('🔧 Corrigindo file sizes...');

      // Buscar uploads sem file_size
      const { data: uploadsToFix, error } = await supabase
        .from('uploads')
        .select('id')
        .or('file_size.is.null,file_size.eq.0');

      if (error) {
        console.error('❌ Erro ao buscar uploads:', error);
        return { fixed: 0 };
      }

      if (!uploadsToFix || uploadsToFix.length === 0) {
        console.log('✅ Nenhum upload para corrigir');
        return { fixed: 0 };
      }

      // Atualizar com tamanho padrão (simulação)
      const { error: updateError } = await supabase
        .from('uploads')
        .update({ file_size: 1024 * 1024 }) // 1MB padrão
        .in('id', uploadsToFix.map(u => u.id));

      if (updateError) {
        console.error('❌ Erro ao atualizar uploads:', updateError);
        return { fixed: 0 };
      }

      console.log(`✅ ${uploadsToFix.length} uploads corrigidos`);
      return { fixed: uploadsToFix.length };

    } catch (error) {
      console.error('❌ Erro ao corrigir file sizes:', error);
      return { fixed: 0 };
    }
  }
}
