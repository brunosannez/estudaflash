
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSyncManager } from './useSyncManager';

export const useDataSync = () => {
  const { user } = useAuth();
  const { syncing, hasInitialized, setHasInitialized, forceSyncUserData: baseForceSyncUserData } = useSyncManager();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  const forceSyncUserData = async (): Promise<boolean> => {
    if (!user) {
      console.log('❌ Usuário não autenticado para sincronização');
      return false;
    }

    try {
      console.log('🔄 Iniciando sincronização de dados...');
      const success = await baseForceSyncUserData(user.id);
      
      if (success) {
        console.log('✅ Sincronização bem-sucedida');
        setRetryCount(0);
        return true;
      } else if (retryCount < maxRetries) {
        console.log(`⚠️ Sincronização falhou, tentativa ${retryCount + 1}/${maxRetries}`);
        setRetryCount(prev => prev + 1);
        
        setTimeout(() => {
          forceSyncUserData();
        }, 3000 * (retryCount + 1));
        
        return false;
      } else {
        console.error('❌ Falha na sincronização após múltiplas tentativas');
        setRetryCount(0);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro durante sincronização:', error);
      setRetryCount(0);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const initializeData = async () => {
      if (user && !hasInitialized && isMounted) {
        console.log('🚀 Iniciando sincronização automática inicial...');
        
        try {
          const success = await forceSyncUserData();
          if (success && isMounted) {
            setHasInitialized(true);
          }
        } catch (error) {
          console.error('❌ Erro na sincronização inicial:', error);
          if (isMounted) {
            setHasInitialized(true);
          }
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [user, hasInitialized]);

  return {
    syncing,
    hasInitialized,
    forceSyncUserData
  };
};
