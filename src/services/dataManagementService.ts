
import { AdminDiagnosticsService } from './adminDiagnosticsService';
import { DataManagementCacheService } from './dataManagement/cacheService';
import { StatsCalculatorService } from './dataManagement/statsCalculatorService';
import { DataCleanupService } from './dataManagement/cleanupService';
import type { DataManagementStats, CleanupResult } from '@/types/dataManagement';

export type { DataManagementStats, CleanupResult };

export class DataManagementService {
  static async getManagementStats(useCache = true): Promise<DataManagementStats> {
    // Usar cache se ainda válido
    if (useCache) {
      const cachedStats = DataManagementCacheService.get();
      if (cachedStats) {
        return cachedStats;
      }
    }

    try {
      console.log('📊 DataManagement: Carregando estatísticas via RPC...');
      
      // Primeiro, verificar se usuário é admin com diagnósticos
      const diagnostics = await AdminDiagnosticsService.runDiagnostics();
      console.log('🔍 DataManagement: Diagnósticos:', diagnostics);

      if (!diagnostics.isAdmin) {
        console.warn('⚠️ DataManagement: Usuário não é admin, usando fallback limitado');
        return await this.getManagementStatsFallbackLimited();
      }

      // Tentar obter via RPC
      const rpcStats = await StatsCalculatorService.calculateFromRPC();
      if (rpcStats) {
        // Verificar se os dados fazem sentido
        if (rpcStats.totalFiles === 0 && rpcStats.totalUsers > 0) {
          console.warn('⚠️ DataManagement: Dados inconsistentes detectados, verificando...');
          const fallbackStats = await StatsCalculatorService.calculateFromFallback();
          
          // Se o fallback tem dados reais, usar eles
          if (fallbackStats.totalFiles > 0) {
            console.log('🔄 DataManagement: Usando dados do fallback que são mais precisos');
            DataManagementCacheService.set(fallbackStats);
            return fallbackStats;
          }
        }

        // Atualizar cache
        DataManagementCacheService.set(rpcStats);
        return rpcStats;
      }

      // Fallback se RPC falhou
      console.log('🔄 DataManagement: Tentando fallback completo...');
      const fallbackStats = await StatsCalculatorService.calculateFromFallback();
      DataManagementCacheService.set(fallbackStats);
      return fallbackStats;

    } catch (error) {
      console.error('💥 DataManagement: Erro geral:', error);
      return await StatsCalculatorService.calculateFromFallback();
    }
  }

  static async getManagementStatsFallbackLimited(): Promise<DataManagementStats> {
    console.log('🔄 DataManagement: Fallback limitado (usuário não admin)');
    return StatsCalculatorService.getBasicStats();
  }

  static async cleanupOldFiles(daysThreshold = 30): Promise<CleanupResult> {
    const result = await DataCleanupService.cleanupOldFiles(daysThreshold);
    
    // Invalidar cache após limpeza
    DataManagementCacheService.invalidate();
    
    return result;
  }

  static invalidateCache(): void {
    DataManagementCacheService.invalidate();
  }
}
