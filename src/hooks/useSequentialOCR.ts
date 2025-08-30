import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface OCRResult {
  imageUrl: string;
  extractedText: string;
  fileName: string;
  success: boolean;
  error?: string;
  processingTime?: number;
}

// Função para redimensionar e comprimir imagem
const compressImage = (file: File, maxWidth = 1200, quality = 0.85): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Desenhar imagem redimensionada
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Converter para blob e depois para file
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file); // Fallback para arquivo original
        }
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const useSequentialOCR = () => {
  const { user } = useAuth();

  const uploadImageToStorage = useCallback(async (file: File, index: number): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');

    // Comprimir imagem se for maior que 2MB
    let processedFile = file;
    if (file.size > 2 * 1024 * 1024) {
      console.log(`🗜️ Compressing large image: ${file.name}`);
      processedFile = await compressImage(file, 1200, 0.85);
      console.log(`✅ Compressed: ${(file.size / 1024).toFixed(1)}KB → ${(processedFile.size / 1024).toFixed(1)}KB`);
    }

    const fileExt = processedFile.type.split('/')[1] || 'jpg';
    const fileName = `${user.id}/${Date.now()}_${index}.${fileExt}`;
    const filePath = `study-images/${fileName}`;

    console.log(`⬆️ Uploading image ${index + 1}:`, processedFile.name, `(${(processedFile.size / 1024).toFixed(2)}KB)`);

    const { error: uploadError } = await supabase.storage
      .from('study-images')
      .upload(filePath, processedFile, {
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
    console.log(`🚀 Starting optimized OCR for ${files.length} images`);
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const results: OCRResult[] = [];
    const BATCH_SIZE = 3; // Processar 3 imagens em paralelo
    const TIMEOUT_MS = 45000; // 45 segundos timeout por imagem
    
    // Processar em lotes de 3 imagens
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(files.length / BATCH_SIZE);
      
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} images)`);
      
      onProgress?.(
        i, 
        files.length, 
        `Processando lote ${batchNumber}/${totalBatches} (${batch.length} imagens)...`
      );

      // Processar lote em paralelo com timeout
      const batchPromises = batch.map(async (file, batchIndex) => {
        const globalIndex = i + batchIndex;
        const startTime = Date.now();
        
        return Promise.race([
          processSingleImageWithTimeout(file, globalIndex),
          new Promise<OCRResult>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS)
          )
        ]).catch((error) => ({
          imageUrl: '',
          extractedText: '',
          fileName: file.name,
          success: false,
          error: error.message === 'Timeout' ? 'Timeout após 45s' : error.message,
          processingTime: Date.now() - startTime
        }));
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      const successCount = batchResults.filter(r => r.success).length;
      console.log(`✅ Batch ${batchNumber} completed: ${successCount}/${batch.length} successful`);
      
      // Atualizar progresso
      onProgress?.(i + batch.length, files.length, `Lote ${batchNumber}/${totalBatches} concluído`);
      
      // Pequena pausa entre lotes para não sobrecarregar
      if (i + BATCH_SIZE < files.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const totalSuccess = results.filter(r => r.success).length;
    console.log(`📊 OCR processing complete: ${totalSuccess}/${files.length} images processed successfully`);
    
    if (totalSuccess === 0) {
      throw new Error('Nenhuma imagem foi processada com sucesso. Verifique as imagens e tente novamente.');
    }
    
    return results;
  }, [user]);

  // Helper function para processar uma única imagem com tracking de tempo
  const processSingleImageWithTimeout = async (file: File, index: number): Promise<OCRResult> => {
    const startTime = Date.now();
    
    try {
      console.log(`🖼️ Processing image ${index + 1}: ${file.name}`);
      
      // Upload image
      const imageUrl = await uploadImageToStorage(file, index);
      
      // Perform OCR
      const extractedText = await performOCR(imageUrl);
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ Image ${index + 1} completed in ${processingTime}ms`);
      
      return {
        imageUrl,
        extractedText,
        fileName: file.name,
        success: true,
        processingTime
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Failed to process image ${index + 1}:`, error);
      
      return {
        imageUrl: '',
        extractedText: '',
        fileName: file.name,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        processingTime
      };
    }
  };

  return {
    processImages,
    uploadImageToStorage,
    performOCR
  };
};