
import { supabase } from '@/integrations/supabase/client';
import type { DataManagementStats } from '@/types/dataManagement';

interface UploadRecord {
  file_size: number | null;
  data_upload: string;
  user_id: string;
  arquivo_original_nome: string | null;
}

interface UserRecord {
  user_id: string;
  plano: string | null;
}

export class StatsCalculatorService {
  static async calculateFromRPC(): Promise<DataManagementStats | null> {
    try {
      const { data: statsData, error } = await supabase.rpc('get_data_management_stats');

      if (error) {
        console.error('❌ StatsCalculator: Erro na RPC:', error);
        return null;
      }

      if (!statsData || statsData.length === 0) {
        console.warn('⚠️ StatsCalculator: RPC retornou dados vazios');
        return null;
      }

      const stat = statsData[0];
      console.log('✅ StatsCalculator: Estatísticas carregadas via RPC:', stat);

      // Garantir que storage_by_plan seja um objeto válido
      let storageByPlan: Record<string, any> = {};
      if (stat.storage_by_plan && typeof stat.storage_by_plan === 'object') {
        storageByPlan = stat.storage_by_plan as Record<string, any>;
      }

      return {
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
    } catch (error) {
      console.error('💥 StatsCalculator: Erro geral na RPC:', error);
      return null;
    }
  }

  static async calculateFromFallback(): Promise<DataManagementStats> {
    try {
      console.log('🔄 StatsCalculator: Executando fallback completo...');

      const [uploadsResult, usersResult] = await Promise.all([
        supabase.from('uploads').select('file_size, data_upload, user_id, arquivo_original_nome'),
        supabase.from('uso_usuarios').select('user_id, plano')
      ]);

      const uploads = (uploadsResult.data || []) as UploadRecord[];
      const users = (usersResult.data || []) as UserRecord[];
      
      console.log('📊 StatsCalculator Fallback: Uploads encontrados:', uploads.length);
      console.log('📊 StatsCalculator Fallback: Usuários encontrados:', users.length);

      const totalFiles = uploads.length;
      const totalStorageBytes = uploads.reduce((acc, upload) => acc + (upload.file_size || 0), 0);
      const totalStorageMB = totalStorageBytes / (1024 * 1024);
      const totalUsers = users.length;
      const averageStoragePerUser = totalUsers > 0 ? totalStorageMB / totalUsers : 0;

      console.log('💾 StatsCalculator Fallback: Storage total:', totalStorageMB, 'MB');

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

      // Storage por plano
      const storageByPlan = this.calculateStorageByPlan(uploads, users);

      const stats = {
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

      console.log('✅ StatsCalculator: Estatísticas carregadas via fallback completo');
      return stats;
    } catch (error) {
      console.error('💥 StatsCalculator: Erro no fallback completo:', error);
      return this.getBasicStats();
    }
  }

  private static calculateStorageByPlan(uploads: UploadRecord[], users: UserRecord[]): Record<string, any> {
    const storageByPlan: Record<string, any> = {};
    
    // Agrupar usuários por plano
    const usersByPlan = users.reduce((acc, user) => {
      const plan = user.plano || 'free';
      if (!acc[plan]) acc[plan] = [];
      acc[plan].push(user.user_id);
      return acc;
    }, {} as Record<string, string[]>);

    // Calcular storage por plano
    Object.entries(usersByPlan).forEach(([plan, userIds]) => {
      const planUploads = uploads.filter(upload => userIds.includes(upload.user_id));
      const planStorageBytes = planUploads.reduce((acc, upload) => acc + (upload.file_size || 0), 0);
      
      storageByPlan[plan] = {
        storage_mb: planStorageBytes / (1024 * 1024),
        user_count: userIds.length,
        file_count: planUploads.length
      };
    });

    console.log('📊 StatsCalculator: Storage por plano:', storageByPlan);
    return storageByPlan;
  }

  static getBasicStats(): DataManagementStats {
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
