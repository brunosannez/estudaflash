
import { supabase } from '@/integrations/supabase/client';

export interface StorageUploadResult {
  publicUrl: string;
  filePath: string;
  fileSize: number;
}

export class StorageService {
  static async uploadImage(file: File, userId: string, index: number = 0): Promise<StorageUploadResult> {
    try {
      const fileSizeInBytes = file.size;
      const fileName = `${userId}/${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      console.log(`📤 Uploading ${file.name} (${(fileSizeInBytes / (1024 * 1024)).toFixed(2)}MB) to: ${fileName}`);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('study-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Upload error details:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      if (!uploadData?.path) {
        throw new Error('Upload concluído mas nenhum caminho foi retornado');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('study-images')
        .getPublicUrl(fileName);

      if (!publicUrl || !publicUrl.includes('study-images')) {
        throw new Error('URL pública inválida gerada');
      }

      console.log(`✅ Image uploaded successfully:`, uploadData.path);
      
      return {
        publicUrl,
        filePath: uploadData.path,
        fileSize: fileSizeInBytes,
      };
    } catch (error) {
      console.error(`❌ Error uploading image:`, error);
      throw error;
    }
  }

  static async deleteImage(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('study-images')
        .remove([filePath]);

      if (error) {
        console.error('❌ Delete error:', error);
        throw new Error(`Erro ao deletar arquivo: ${error.message}`);
      }

      console.log(`✅ Image deleted successfully: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error deleting image:`, error);
      throw error;
    }
  }

  static async getStorageUsage(userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_storage_usage', { user_uuid: userId });
      
      if (error) {
        console.error('❌ Storage usage error:', error);
        throw error;
      }
      
      return data?.[0] || { total_files: 0, total_size_bytes: 0, total_size_mb: 0 };
    } catch (error) {
      console.error('❌ Error getting storage usage:', error);
      throw error;
    }
  }
}
