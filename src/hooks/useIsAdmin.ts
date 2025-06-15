
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Verificando status admin para usuário:', user.email);
        
        const { data, error } = await supabase.rpc('is_admin', {
          user_uuid: user.id
        });

        if (error) {
          console.error('❌ Erro ao verificar status de admin:', error);
          setIsAdmin(false);
        } else {
          console.log('✅ Status admin verificado:', data);
          setIsAdmin(data || false);
        }
      } catch (error) {
        console.error('❌ Erro na verificação de admin:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};
