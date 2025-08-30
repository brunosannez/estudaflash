import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface OCRResult {
  imageUrl: string;
  extractedText: string;
  fileName: string;
  success: boolean;
  error?: string;
}

export const useSequentialOCR = () => {
  const { user } = useAuth();

  const uploadImageToStorage = useCallback(async (file: File, index: number): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${Date.now()}_${index}.${fileExt}`;
    const filePath = `study-images/${fileName}`;

    console.log(`⬆️ Uploading image ${index + 1}:`, file.name, `(${(file.size / 1024).toFixed(2)}KB)`);

    const { error: uploadError } = await supabase.storage
      .from('study-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('study-images')
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;
    console.log(`✅ Image uploaded:`, imageUrl);
    
    return imageUrl;
  }, [user]);

  const performOCR = useCallback(async (imageUrl: string, retries = 3): Promise<string> => {
    console.log(`👁️ Starting OCR for:`, imageUrl);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 OCR attempt ${attempt}/${retries}`);

        const { data, error } = await supabase.functions.invoke('extract-text-from-image', {
          body: {
            imageUrl,
            userId: user?.id
          }
        });

        if (error) {
          console.error(`❌ OCR error (attempt ${attempt}):`, error);
          if (attempt === retries) throw error;
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        if (!data?.extractedText) {
          console.warn(`⚠️ No text extracted (attempt ${attempt})`);
          if (attempt === retries) {
            return ''; // Return empty string instead of throwing
          }
          continue;
        }

        console.log(`✅ OCR successful (${data.extractedText.length} characters)`);
        return data.extractedText;

      } catch (error) {
        console.error(`❌ OCR attempt ${attempt} failed:`, error);
        if (attempt === retries) {
          throw new Error(`OCR falhou após ${retries} tentativas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    return ''; // Fallback
  }, [user]);

  const processImages = useCallback(async (
    files: File[],
    onProgress?: (current: number, total: number, message: string) => void
  ): Promise<OCRResult[]> => {
    console.log(`🚀 Starting sequential OCR for ${files.length} images`);
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const results: OCRResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Update progress - Upload phase
        onProgress?.(i * 2 + 1, files.length * 2, `Enviando imagem ${i + 1}/${files.length}...`);
        
        // Upload image
        const imageUrl = await uploadImageToStorage(file, i);
        
        // Update progress - OCR phase
        onProgress?.(i * 2 + 2, files.length * 2, `Analisando imagem ${i + 1}/${files.length}...`);
        
        // Perform OCR
        const extractedText = await performOCR(imageUrl);
        
        results.push({
          imageUrl,
          extractedText,
          fileName: file.name,
          success: true
        });
        
        console.log(`✅ Processed image ${i + 1}/${files.length}: ${extractedText.length} chars extracted`);
        
      } catch (error) {
        console.error(`❌ Failed to process image ${i + 1}:`, error);
        
        results.push({
          imageUrl: '',
          extractedText: '',
          fileName: file.name,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`📊 OCR processing complete: ${successCount}/${files.length} images processed successfully`);
    
    return results;
  }, [user, uploadImageToStorage, performOCR]);

  return {
    processImages,
    uploadImageToStorage,
    performOCR
  };
};