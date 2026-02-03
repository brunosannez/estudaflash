import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('🔍 useIsAdmin: Verificando status de admin');
      
      if (!user) {
        console.log('❌ useIsAdmin: Usuário não autenticado');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Use the secure RPC function to check admin status
        const { data: isAdminResult, error: rpcError } = await supabase.rpc('is_current_user_admin');
        
        if (rpcError) {
          console.error('❌ useIsAdmin: Erro ao verificar status de admin:', rpcError);
          setIsAdmin(false);
        } else {
          console.log('✅ useIsAdmin: Status de admin:', isAdminResult);
          setIsAdmin(isAdminResult === true);
        }
      } catch (error) {
        console.error('💥 useIsAdmin: Erro geral na verificação:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
        console.log('🏁 useIsAdmin: Verificação concluída');
      }
    };

    checkAdminStatus();
  }, [user]);

  // SECURITY: Admin promotion must be done through server-side processes only
  // The makeCurrentUserAdmin function has been removed for security reasons

  return { 
    isAdmin, 
    loading 
  };
};
