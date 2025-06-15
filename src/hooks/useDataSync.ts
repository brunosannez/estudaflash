
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSyncManager } from './useSyncManager';
import { useConsistencyChecker } from './useConsistencyChecker';
import { useRealUserCounts } from './useRealUserCounts';

export const useDataSync = () => {
  const { user } = useAuth();
  const { syncing, hasInitialized, setHasInitialized, forceSyncUserData: baseForceSyncUserData } = useSyncManager();
  const { checkDataConsistency } = useConsistencyChecker();
  const { getRealUserCounts } = useRealUserCounts();

  const forceSyncUserData = async () => {
    if (!user) return false;
    return await baseForceSyncUserData(user.id);
  };

  const checkDataConsistencyForCurrentUser = async () => {
    if (!user) return null;
    return await checkDataConsistency(user.id);
  };

  const getRealUserCountsForCurrentUser = async () => {
    if (!user) throw new Error('User not authenticated');
    return await getRealUserCounts(user.id);
  };

  // Sincronização automática na inicialização
  useEffect(() => {
    if (user && !hasInitialized) {
      console.log('🚀 Iniciando sincronização automática...');
      forceSyncUserData();
    }
  }, [user, hasInitialized]);

  return {
    syncing,
    hasInitialized,
    forceSyncUserData,
    checkDataConsistency: checkDataConsistencyForCurrentUser,
    getRealUserCounts: getRealUserCountsForCurrentUser
  };
};
