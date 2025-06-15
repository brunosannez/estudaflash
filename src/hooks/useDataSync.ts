
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSyncManager } from './useSyncManager';
import { useConsistencyChecker } from './useConsistencyChecker';
import { useRealUserCounts } from './useRealUserCounts';

export const useDataSync = () => {
  const { user } = useAuth();
  const { syncing, hasInitialized, setHasInitialized, forceSyncUserData: baseForceSyncUserData } = useSyncManager();
  const { checkDataConsistency } = useConsistencyChecker();
  const { getRealUserCounts } = useRealUserCounts();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

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
        
        // Retry after a delay
        setTimeout(() => {
          forceSyncUserData();
        }, 1000 * (retryCount + 1)); // Exponential backoff
        
        return false;
      } else {
        console.error('❌ Falha na sincronização após múltiplas tentativas');
        setRetryCount(0);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro durante sincronização:', error);
      return false;
    }
  };

  const checkDataConsistencyForCurrentUser = async () => {
    if (!user) return null;
    return await checkDataConsistency(user.id);
  };

  const getRealUserCountsForCurrentUser = async () => {
    if (!user) throw new Error('User not authenticated');
    return await getRealUserCounts(user.id);
  };

  // Enhanced automatic synchronization on initialization
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
    forceSyncUserData,
    checkDataConsistency: checkDataConsistencyForCurrentUser,
    getRealUserCounts: getRealUserCountsForCurrentUser
  };
};
