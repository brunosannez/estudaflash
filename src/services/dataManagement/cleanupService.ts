
import { supabase } from '@/integrations/supabase/client';
import type { CleanupResult } from '@/types/dataManagement';

export class DataCleanupService {
  static async cleanupOldFiles(daysThreshold = 30): Promise<CleanupResult> {
    try {
      console.log(`🧹 DataCleanup: Iniciando limpeza de arquivos com ${daysThreshold} dias...`);
      
      const { data: result, error } = await supabase.rpc('cleanup_old_files', {
        days_threshold: daysThreshold
      });

      if (error) {
        console.error('❌ DataCleanup: Erro na limpeza:', error);
        throw error;
      }

      if (!result || result.length === 0) {
        return { deletedFiles: 0, freedStorageMB: 0 };
      }

      const cleanupResult = result[0];
      console.log('✅ DataCleanup: Limpeza concluída:', cleanupResult);

      return {
        deletedFiles: cleanupResult.deleted_files || 0,
        freedStorageMB: Number(cleanupResult.freed_storage_mb) || 0
      };
    } catch (error) {
      console.error('💥 DataCleanup: Erro na limpeza:', error);
      throw error;
    }
  }
}
