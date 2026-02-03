import { supabase } from '@/integrations/supabase/client';

export interface InvokeResult<T = any> {
  data: T | null;
  error: Error | null;
}

/**
 * Helper para invocar Edge Functions com Authorization header explícito.
 * Garante que o token JWT seja sempre enviado, mesmo que o Supabase não o faça automaticamente.
 */
export const edgeFunctionInvoker = {
  async invoke<T = any>(
    functionName: string,
    body: Record<string, any>
  ): Promise<InvokeResult<T>> {
    try {
      // Obter sessão atual
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Erro ao obter sessão:', sessionError);
        return {
          data: null,
          error: new Error('Erro ao verificar autenticação. Faça login novamente.')
        };
      }

      const session = sessionData?.session;
      
      if (!session?.access_token) {
        console.error('❌ Sessão não encontrada ou token ausente');
        return {
          data: null,
          error: new Error('Sessão expirada. Faça login novamente.')
        };
      }

      console.log(`🚀 Invocando Edge Function: ${functionName}`);
      console.log('🔑 Token presente:', !!session.access_token);

      // Invocar função com Authorization header explícito
      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error(`❌ Erro na Edge Function ${functionName}:`, error);
        return { data: null, error };
      }

      console.log(`✅ Edge Function ${functionName} executada com sucesso`);
      return { data: data as T, error: null };

    } catch (error) {
      console.error(`❌ Erro inesperado ao invocar ${functionName}:`, error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Erro desconhecido')
      };
    }
  }
};
