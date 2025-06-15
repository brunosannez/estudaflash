
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('🔍 useIsAdmin: Iniciando verificação de admin');
      console.log('👤 useIsAdmin: User atual:', user?.id, user?.email);

      if (!user) {
        console.log('❌ useIsAdmin: Usuário não autenticado');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 useIsAdmin: Chamando função check_user_is_admin');
        
        // Usar a nova função RPC mais confiável
        const { data: isAdminResult, error: rpcError } = await supabase
          .rpc('check_user_is_admin', { user_uuid: user.id });

        console.log('📊 useIsAdmin: Resultado da RPC:', isAdminResult);
        console.log('⚠️ useIsAdmin: Erro da RPC:', rpcError);

        if (rpcError) {
          console.error('❌ useIsAdmin: Erro na função RPC:', rpcError);
          
          // Fallback: verificar diretamente na tabela admin_users
          console.log('🔄 useIsAdmin: Tentando fallback direto na tabela');
          const { data: adminData, error: directError } = await supabase
            .from('admin_users')
            .select('id')
            .eq('user_id', user.id)
            .single();

          console.log('📊 useIsAdmin: Resultado do fallback:', adminData);
          console.log('⚠️ useIsAdmin: Erro do fallback:', directError);

          if (directError && directError.code !== 'PGRST116') {
            console.error('❌ useIsAdmin: Erro no fallback:', directError);
            setIsAdmin(false);
          } else {
            const adminStatus = !!adminData;
            console.log('✅ useIsAdmin: Status admin (fallback):', adminStatus);
            setIsAdmin(adminStatus);
          }
        } else {
          const adminStatus = !!isAdminResult;
          console.log('✅ useIsAdmin: Status admin (RPC):', adminStatus);
          setIsAdmin(adminStatus);
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

  // Log do estado atual sempre que mudar
  useEffect(() => {
    console.log('🎯 useIsAdmin: Estado atual - isAdmin:', isAdmin, 'loading:', loading);
  }, [isAdmin, loading]);

  return { isAdmin, loading };
};
