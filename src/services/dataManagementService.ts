
import { supabase } from '@/integrations/supabase/client';

export interface DataManagementStats {
  totalFiles: number;
  totalStorageMB: number;
  averageStoragePerUser: number;
  totalUsers: number;
  filesOlderThan30Days: number;
  filesOlderThan7Days: number;
  activeUsers30Days: number;
  largestFileSizeMB: number;
  storageByPlan: Record<string, {
    storage_mb: number;
    user_count: number;
    file_count: number;
  }>;
}

export interface CleanupResult {
  deletedFiles: number;
  freedStorageMB: number;
}

export class DataManagementService {
  private static cache: {
    stats: DataManagementStats | null;
    timestamp: number;
  } = { stats: null, timestamp: 0 };

  private static CACHE_DURATION = 30000; // 30 segundos

  static async getManagementStats(useCache = true): Promise<DataManagementStats> {
    const now = Date.now();
    
    // Usar cache se ainda válido
    if (useCache && this.cache.stats && (now - this.cache.timestamp) < this.CACHE_DURATION) {
      console.log('📊 DataManagement: Usando dados do cache');
      return this.cache.stats;
    }

    try {
      console.log('📊 DataManagement: Carregando estatísticas via RPC...');
      
      const { data: statsData, error } = await supabase.rpc('get_data_management_stats');

      if (error) {
        console.error('❌ DataManagement: Erro na RPC:', error);
        return await this.getManagementStatsFallback();
      }

      if (!statsData || statsData.length === 0) {
        console.warn('⚠️ DataManagement: RPC retornou dados vazios');
        return await this.getManagementStatsFallback();
      }

      const stat = statsData[0];
      console.log('✅ DataManagement: Estatísticas carregadas via RPC:', stat);

      // Garantir que storage_by_plan seja um objeto válido
      let storageByPlan: Record<string, any> = {};
      if (stat.storage_by_plan && typeof stat.storage_by_plan === 'object') {
        storageByPlan = stat.storage_by_plan as Record<string, any>;
      }

      const managementStats: DataManagementStats = {
        totalFiles: Number(stat.total_files) || 0,
        totalStorageMB: Number(stat.total_storage_mb) || 0,
        averageStoragePerUser: Number(stat.average_storage_per_user) || 0,
        totalUsers: Number(stat.total_users) || 0,
        filesOlderThan30Days: Number(stat.files_older_than_30_days) || 0,
        filesOlderThan7Days: Number(stat.files_older_than_7_days) || 0,
        activeUsers30Days: Number(stat.active_users_30_days) || 0,
        largestFileSizeMB: Number(stat.largest_file_size_mb) || 0,
        storageByPlan: storageByPlan
      };

      // Atualizar cache
      this.cache = {
        stats: managementStats,
        timestamp: now
      };

      return managementStats;
    } catch (error) {
      console.error('💥 DataManagement: Erro geral:', error);
      return await this.getManagementStatsFallback();
    }
  }

  static async getManagementStatsFallback(): Promise<DataManagementStats> {
    try {
      console.log('🔄 DataManagement: Executando fallback...');

      const [uploadsResult, usersResult] = await Promise.all([
        supabase.from('uploads').select('file_size, data_upload, user_id'),
        supabase.from('uso_usuarios').select('user_id, plano')
      ]);

      const uploads = uploadsResult.data || [];
      const users = usersResult.data || [];
      
      const totalFiles = uploads.length;
      const totalStorageBytes = uploads.reduce((acc, upload) => acc + (upload.file_size || 0), 0);
      const totalStorageMB = totalStorageBytes / (1024 * 1024);
      const totalUsers = users.length;
      const averageStoragePerUser = totalUsers > 0 ? totalStorageMB / totalUsers : 0;

      // Calcular arquivos antigos
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const filesOlderThan30Days = uploads.filter(upload => 
        new Date(upload.data_upload) < thirtyDaysAgo
      ).length;

      const filesOlderThan7Days = uploads.filter(upload => 
        new Date(upload.data_upload) < sevenDaysAgo
      ).length;

      // Usuários ativos nos últimos 30 dias
      const activeUsers30Days = new Set(
        uploads
          .filter(upload => new Date(upload.data_upload) >= thirtyDaysAgo)
          .map(upload => upload.user_id)
      ).size;

      // Maior arquivo
      const largestFileSizeMB = uploads.reduce((max, upload) => {
        const sizeMB = (upload.file_size || 0) / (1024 * 1024);
        return sizeMB > max ? sizeMB : max;
      }, 0);

      // Storage por plano (simplificado no fallback)
      const storageByPlan: Record<string, any> = {};
      ['free', 'pro', 'edu'].forEach(plan => {
        const planUsers = users.filter(u => u.plano === plan);
        storageByPlan[plan] = {
          storage_mb: 0, // Seria necessário join para calcular exato
          user_count: planUsers.length,
          file_count: 0
        };
      });

      console.log('✅ DataManagement: Estatísticas carregadas via fallback');

      return {
        totalFiles,
        totalStorageMB,
        averageStoragePerUser,
        totalUsers,
        filesOlderThan30Days,
        filesOlderThan7Days,
        activeUsers30Days,
        largestFileSizeMB,
        storageByPlan
      };
    } catch (error) {
      console.error('💥 DataManagement: Erro no fallback:', error);
      return {
        totalFiles: 0,
        totalStorageMB: 0,
        averageStoragePerUser: 0,
        totalUsers: 0,
        filesOlderThan30Days: 0,
        filesOlderThan7Days: 0,
        activeUsers30Days: 0,
        largestFileSizeMB: 0,
        storageByPlan: {}
      };
    }
  }

  static async cleanupOldFiles(daysThreshold = 30): Promise<CleanupResult> {
    try {
      console.log(`🧹 DataManagement: Iniciando limpeza de arquivos com ${daysThreshold} dias...`);
      
      const { data: result, error } = await supabase.rpc('cleanup_old_files', {
        days_threshold: daysThreshold
      });

      if (error) {
        console.error('❌ DataManagement: Erro na limpeza:', error);
        throw error;
      }

      if (!result || result.length === 0) {
        return { deletedFiles: 0, freedStorageMB: 0 };
      }

      const cleanupResult = result[0];
      console.log('✅ DataManagement: Limpeza concluída:', cleanupResult);

      // Invalidar cache após limpeza
      this.cache.timestamp = 0;

      return {
        deletedFiles: cleanupResult.deleted_files || 0,
        freedStorageMB: Number(cleanupResult.freed_storage_mb) || 0
      };
    } catch (error) {
      console.error('💥 DataManagement: Erro na limpeza:', error);
      throw error;
    }
  }

  static invalidateCache(): void {
    this.cache.timestamp = 0;
    console.log('🔄 DataManagement: Cache invalidado');
  }
}
