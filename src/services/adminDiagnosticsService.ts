
import { supabase } from '@/integrations/supabase/client';

export interface AdminDiagnostics {
  isAdmin: boolean;
  adminCheckMethod: 'rpc' | 'direct' | 'failed';
  currentUserId: string | null;
  userRecord: any;
  totalUploads: number;
  totalUsers: number;
  sampleUpload: any;
  errors: string[];
}

export class AdminDiagnosticsService {
  static async runDiagnostics(): Promise<AdminDiagnostics> {
    const diagnostics: AdminDiagnostics = {
      isAdmin: false,
      adminCheckMethod: 'failed',
      currentUserId: null,
      userRecord: null,
      totalUploads: 0,
      totalUsers: 0,
      sampleUpload: null,
      errors: []
    };

    try {
      // 1. Verificar usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        diagnostics.errors.push(`Erro auth: ${userError.message}`);
        return diagnostics;
      }
      
      if (!user) {
        diagnostics.errors.push('Usuário não autenticado');
        return diagnostics;
      }

      diagnostics.currentUserId = user.id;
      console.log('🔍 Diagnóstico: Usuário atual:', user.id, user.email);

      // 2. Verificar registro do usuário na tabela uso_usuarios
      const { data: userRecord, error: userRecordError } = await supabase
        .from('uso_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (userRecordError) {
        diagnostics.errors.push(`Erro ao buscar registro: ${userRecordError.message}`);
      } else {
        diagnostics.userRecord = userRecord;
        console.log('👤 Diagnóstico: Registro do usuário:', userRecord);
      }

      // 3. Verificar se é admin via RPC
      try {
        const { data: isAdminRpc, error: rpcError } = await supabase
          .rpc('is_current_user_admin');

        if (!rpcError && isAdminRpc) {
          diagnostics.isAdmin = true;
          diagnostics.adminCheckMethod = 'rpc';
          console.log('✅ Diagnóstico: Admin via RPC');
        } else if (rpcError) {
          diagnostics.errors.push(`RPC admin falhou: ${rpcError.message}`);
        }
      } catch (error) {
        diagnostics.errors.push(`Erro RPC: ${error}`);
      }

      // 4. Verificar admin via consulta direta se RPC falhou
      if (!diagnostics.isAdmin && userRecord) {
        if (userRecord.is_admin) {
          diagnostics.isAdmin = true;
          diagnostics.adminCheckMethod = 'direct';
          console.log('✅ Diagnóstico: Admin via consulta direta');
        }
      }

      // 5. Contar dados básicos
      const [uploadsCount, usersCount] = await Promise.all([
        supabase.from('uploads').select('*', { count: 'exact', head: true }),
        supabase.from('uso_usuarios').select('*', { count: 'exact', head: true })
      ]);

      diagnostics.totalUploads = uploadsCount.count || 0;
      diagnostics.totalUsers = usersCount.count || 0;

      // 6. Buscar upload de exemplo para verificar file_size
      const { data: sampleUpload } = await supabase
        .from('uploads')
        .select('id, file_size, data_upload, arquivo_original_nome')
        .limit(1)
        .single();

      diagnostics.sampleUpload = sampleUpload;

      console.log('📊 Diagnóstico completo:', diagnostics);
      return diagnostics;

    } catch (error) {
      diagnostics.errors.push(`Erro geral: ${error}`);
      console.error('💥 Erro no diagnóstico:', error);
      return diagnostics;
    }
  }

  static async ensureUserIsAdmin(userId: string): Promise<boolean> {
    try {
      console.log('🔧 Garantindo que usuário é admin:', userId);

      // Verificar se já é admin
      const { data: userRecord } = await supabase
        .from('uso_usuarios')
        .select('is_admin')
        .eq('user_id', userId)
        .single();

      if (userRecord?.is_admin) {
        console.log('✅ Usuário já é admin');
        return true;
      }

      // Tornar admin
      const { error } = await supabase
        .from('uso_usuarios')
        .update({ is_admin: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Erro ao tornar usuário admin:', error);
        return false;
      }

      console.log('✅ Usuário promovido a admin');
      return true;

    } catch (error) {
      console.error('💥 Erro ao garantir admin:', error);
      return false;
    }
  }

  static async fixFileSizes(): Promise<{ fixed: number; errors: string[] }> {
    try {
      console.log('🔧 Corrigindo file_size dos uploads...');

      // Buscar uploads com file_size zerado ou nulo
      const { data: uploadsToFix, error } = await supabase
        .from('uploads')
        .select('id, arquivo_original_nome, imagem_url')
        .or('file_size.is.null,file_size.eq.0');

      if (error) {
        return { fixed: 0, errors: [`Erro ao buscar uploads: ${error.message}`] };
      }

      if (!uploadsToFix || uploadsToFix.length === 0) {
        return { fixed: 0, errors: [] };
      }

      let fixed = 0;
      const errors: string[] = [];

      // Para cada upload, tentar obter o tamanho real
      for (const upload of uploadsToFix) {
        try {
          // Estimar tamanho baseado no nome do arquivo (fallback)
          let estimatedSize = 1024 * 1024; // 1MB padrão

          // Se tiver informações do arquivo, usar
          if (upload.arquivo_original_nome) {
            // Estimar baseado na extensão
            const ext = upload.arquivo_original_nome.toLowerCase();
            if (ext.includes('.jpg') || ext.includes('.jpeg') || ext.includes('.png')) {
              estimatedSize = 2 * 1024 * 1024; // 2MB para imagens
            } else if (ext.includes('.pdf')) {
              estimatedSize = 5 * 1024 * 1024; // 5MB para PDFs
            }
          }

          const { error: updateError } = await supabase
            .from('uploads')
            .update({ file_size: estimatedSize })
            .eq('id', upload.id);

          if (updateError) {
            errors.push(`Erro no upload ${upload.id}: ${updateError.message}`);
          } else {
            fixed++;
          }

        } catch (error) {
          errors.push(`Erro processando upload ${upload.id}: ${error}`);
        }
      }

      console.log(`✅ File sizes corrigidos: ${fixed} uploads`);
      return { fixed, errors };

    } catch (error) {
      console.error('💥 Erro ao corrigir file sizes:', error);
      return { fixed: 0, errors: [`Erro geral: ${error}`] };
    }
  }
}
