
import { supabase } from '@/integrations/supabase/client';

export interface AdminDashboardStats {
  totalUsers: number;
  totalStorageMB: number;
  activeUsers7Days: number;
}

export class AdminStatsService {
  static async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      console.log('📊 Carregando estatísticas via RPC...');
      
      const { data: stats, error } = await supabase.rpc('get_admin_dashboard_stats');

      if (error) {
        console.error('❌ Erro na RPC get_admin_dashboard_stats:', error);
        // Fallback: carregar estatísticas manualmente
        return await this.getDashboardStatsFallback();
      }

      if (!stats || stats.length === 0) {
        console.warn('⚠️ RPC retornou dados vazios, usando fallback');
        return await this.getDashboardStatsFallback();
      }

      const stat = stats[0];
      console.log('✅ Estatísticas carregadas via RPC:', stat);

      return {
        totalUsers: Number(stat.total_users) || 0,
        totalStorageMB: Number(stat.total_storage_mb) || 0,
        activeUsers7Days: Number(stat.active_users_7_days) || 0
      };
    } catch (error) {
      console.error('💥 Erro geral ao carregar estatísticas:', error);
      return await this.getDashboardStatsFallback();
    }
  }

  static async getDashboardStatsFallback(): Promise<AdminDashboardStats> {
    try {
      console.log('🔄 Carregando estatísticas via fallback...');

      // Carregar dados básicos diretamente das tabelas
      const [usersResult, uploadsResult] = await Promise.all([
        supabase.from('uso_usuarios').select('user_id, created_at'),
        supabase.from('uploads').select('file_size')
      ]);

      const totalUsers = usersResult.data?.length || 0;
      const totalStorageBytes = uploadsResult.data?.reduce((acc, upload) => acc + (upload.file_size || 0), 0) || 0;
      const totalStorageMB = totalStorageBytes / (1024 * 1024);

      // Para usuários ativos, usar uma estimativa baseada em uploads recentes
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentUploads } = await supabase
        .from('uploads')
        .select('user_id')
        .gte('data_upload', sevenDaysAgo.toISOString());

      const activeUsers7Days = new Set(recentUploads?.map(u => u.user_id) || []).size;

      console.log('✅ Estatísticas carregadas via fallback');

      return {
        totalUsers,
        totalStorageMB,
        activeUsers7Days
      };
    } catch (error) {
      console.error('💥 Erro no fallback de estatísticas:', error);
      return {
        totalUsers: 0,
        totalStorageMB: 0,
        activeUsers7Days: 0
      };
    }
  }
}
