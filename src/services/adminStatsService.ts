
import { supabase } from '@/integrations/supabase/client';
import { DataManagementService } from './dataManagementService';

export interface AdminDashboardStats {
  totalUsers: number;
  totalStorageMB: number;
  activeUsers7Days: number;
  totalFiles?: number;
  averageStoragePerUser?: number;
}

export class AdminStatsService {
  static async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      console.log('📊 AdminStats: Carregando estatísticas via RPC...');
      
      const { data: stats, error } = await supabase.rpc('get_admin_dashboard_stats');

      if (error) {
        console.error('❌ AdminStats: Erro na RPC get_admin_dashboard_stats:', error);
        return await this.getDashboardStatsFallback();
      }

      if (!stats || stats.length === 0) {
        console.warn('⚠️ AdminStats: RPC retornou dados vazios, usando fallback');
        return await this.getDashboardStatsFallback();
      }

      const stat = stats[0];
      console.log('✅ AdminStats: Estatísticas carregadas via RPC:', stat);

      // Tentar obter dados adicionais do DataManagementService
      let additionalStats = {};
      try {
        const mgmtStats = await DataManagementService.getManagementStats(true);
        additionalStats = {
          totalFiles: mgmtStats.totalFiles,
          averageStoragePerUser: mgmtStats.averageStoragePerUser
        };
      } catch (error) {
        console.warn('⚠️ AdminStats: Erro ao obter dados adicionais:', error);
      }

      return {
        totalUsers: Number(stat.total_users) || 0,
        totalStorageMB: Number(stat.total_storage_mb) || 0,
        activeUsers7Days: Number(stat.active_users_7_days) || 0,
        ...additionalStats
      };
    } catch (error) {
      console.error('💥 AdminStats: Erro geral ao carregar estatísticas:', error);
      return await this.getDashboardStatsFallback();
    }
  }

  static async getDashboardStatsFallback(): Promise<AdminDashboardStats> {
    try {
      console.log('🔄 AdminStats: Carregando estatísticas via fallback...');

      // Tentar usar DataManagementService primeiro
      try {
        const mgmtStats = await DataManagementService.getManagementStats(false);
        return {
          totalUsers: mgmtStats.totalUsers,
          totalStorageMB: mgmtStats.totalStorageMB,
          activeUsers7Days: mgmtStats.activeUsers30Days, // Aproximação
          totalFiles: mgmtStats.totalFiles,
          averageStoragePerUser: mgmtStats.averageStoragePerUser
        };
      } catch (mgmtError) {
        console.warn('⚠️ AdminStats: DataManagementService falhou, usando fallback básico');
      }

      // Fallback básico original
      const [usersResult, uploadsResult] = await Promise.all([
        supabase.from('uso_usuarios').select('user_id, created_at'),
        supabase.from('uploads').select('file_size, data_upload, user_id')
      ]);

      const totalUsers = usersResult.data?.length || 0;
      const uploads = uploadsResult.data || [];
      const totalStorageBytes = uploads.reduce((acc, upload) => acc + (upload.file_size || 0), 0);
      const totalStorageMB = totalStorageBytes / (1024 * 1024);

      // Para usuários ativos, usar uma estimativa baseada em uploads recentes
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const activeUsers7Days = new Set(
        uploads
          .filter(u => new Date(u.data_upload) >= sevenDaysAgo)
          .map(u => u.user_id)
      ).size;

      console.log('✅ AdminStats: Estatísticas carregadas via fallback básico');

      return {
        totalUsers,
        totalStorageMB,
        activeUsers7Days,
        totalFiles: uploads.length,
        averageStoragePerUser: totalUsers > 0 ? totalStorageMB / totalUsers : 0
      };
    } catch (error) {
      console.error('💥 AdminStats: Erro no fallback básico:', error);
      return {
        totalUsers: 0,
        totalStorageMB: 0,
        activeUsers7Days: 0,
        totalFiles: 0,
        averageStoragePerUser: 0
      };
    }
  }
}
