import { supabase } from '@/integrations/supabase/client';

/**
 * SECURITY: Admin setup functions have been removed from client-side code.
 * 
 * Admin users must be created through secure server-side processes only.
 * This prevents privilege escalation attacks from the client side.
 * 
 * To add an admin user, use one of these secure methods:
 * 1. Direct SQL in Supabase Dashboard (with proper authentication)
 * 2. A secure server-side RPC function with proper authorization checks
 * 3. Supabase Edge Function with admin authentication
 */

export const checkAdminStatus = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_current_user_admin');
    
    if (error) {
      console.error('Erro ao verificar status de admin:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    return false;
  }
};

// Legacy function removed for security - use checkAdminStatus instead
export const ensureAdminUser = async (_email: string): Promise<boolean> => {
  console.warn('⚠️ ensureAdminUser foi desabilitada por razões de segurança');
  console.warn('Admin users devem ser criados através de processos seguros no servidor');
  return false;
};
