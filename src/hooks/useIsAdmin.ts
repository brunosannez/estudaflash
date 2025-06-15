
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
        console.log('🔄 useIsAdmin: Verificando status admin usando tabela uso_usuarios');
        
        // Verificar usando a função is_current_user_admin
        const { data: isAdminResult, error: rpcError } = await supabase
          .rpc('is_current_user_admin');

        console.log('📊 useIsAdmin: Resultado da RPC is_current_user_admin:', isAdminResult);
        console.log('⚠️ useIsAdmin: Erro da RPC:', rpcError);

        if (rpcError) {
          console.error('❌ useIsAdmin: Erro na função RPC:', rpcError);
          
          // Fallback: verificar diretamente na tabela uso_usuarios
          console.log('🔄 useIsAdmin: Tentando fallback direto na tabela uso_usuarios');
          const { data: adminData, error: directError } = await supabase
            .from('uso_usuarios')
            .select('is_admin')
            .eq('user_id', user.id)
            .single();

          console.log('📊 useIsAdmin: Resultado do fallback:', adminData);
          console.log('⚠️ useIsAdmin: Erro do fallback:', directError);

          if (directError && directError.code !== 'PGRST116') {
            console.error('❌ useIsAdmin: Erro no fallback:', directError);
            setIsAdmin(false);
          } else {
            const adminStatus = adminData?.is_admin || false;
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
