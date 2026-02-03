import { supabase } from '@/integrations/supabase/client';

interface DiagnosticsResult {
  isAdmin: boolean;
  adminCheckMethod: string;
  currentUserId?: string;
  errors: string[];
  warnings: string[];
}

export class AdminDiagnosticsService {
  /**
   * Run diagnostics to check current user's admin status
   * SECURITY: This only reads admin status, it cannot modify it
   */
  static async runDiagnostics(): Promise<DiagnosticsResult> {
    const result: DiagnosticsResult = {
      isAdmin: false,
      adminCheckMethod: 'none',
      errors: [],
      warnings: []
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        result.errors.push('Usuário não autenticado');
        return result;
      }

      result.currentUserId = user.id;
      console.log('🔍 Executando diagnósticos para usuário:', user.id);

      // Use the secure RPC function to check admin status
      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('is_current_user_admin');
        
        if (rpcError) {
          result.errors.push(`Erro na função RPC: ${rpcError.message}`);
        } else if (rpcResult === true) {
          result.isAdmin = true;
          result.adminCheckMethod = 'RPC is_current_user_admin';
        }
      } catch (error) {
        result.errors.push(`Erro ao executar RPC: ${error}`);
      }

      console.log('📊 Diagnósticos completos:', result);
      return result;

    } catch (error) {
      result.errors.push(`Erro geral nos diagnósticos: ${error}`);
      return result;
    }
  }

  // SECURITY: All admin promotion functions have been removed
  // Admin users must be created through secure server-side processes only
  // This prevents privilege escalation attacks from the client side
}
