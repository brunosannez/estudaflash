
import { useState } from 'react';
import { useMultipleUploadState } from '@/hooks/useMultipleUploadState';
import { useMultipleUpload } from '@/hooks/useMultipleUpload';
import type { ImageUploadResult, SuccessfulUploadResult } from '@/types/upload';

export const useExpandedUpload = () => {
  const [allUploadedFiles, setAllUploadedFiles] = useState<SuccessfulUploadResult[]>([]);
  const [currentBatch, setCurrentBatch] = useState(1);
  const [isCompleteUpload, setIsCompleteUpload] = useState(false);
  
  const {
    uploadResults,
    isProcessing,
    setIsProcessing,
    initializeResults,
    updateResult,
    resetUpload
  } = useMultipleUploadState();

  const {
    uploadMultipleImages
  } = useMultipleUpload();

  const canAddMoreImages = () => {
    return allUploadedFiles.length < 30;
  };

  const getRemainingSlots = () => {
    return 30 - allUploadedFiles.length;
  };

  const getCurrentBatchSize = () => {
    return Math.min(5, getRemainingSlots());
  };

  const addImageBatch = async (files: File[]): Promise<boolean> => {
    if (!canAddMoreImages()) {
      console.log('❌ Limite máximo de 30 imagens atingido');
      return false;
    }

    if (files.length > getCurrentBatchSize()) {
      console.log(`❌ Máximo ${getCurrentBatchSize()} imagens por batch`);
      return false;
    }

    try {
      const result = await uploadMultipleImages(files);
      
      if (result?.texto_extraido) {
        // Process successful upload
        const successfulResults: SuccessfulUploadResult[] = files.map((file, index) => ({
          file,
          status: 'completed' as const,
          imageUrl: `${result.imagem_url}_${index}`,
          extractedText: result.texto_extraido || ''
        }));
        
        setAllUploadedFiles(prev => [...prev, ...successfulResults]);
        setCurrentBatch(prev => prev + 1);
        
        console.log(`✅ Batch ${currentBatch} adicionado:`, successfulResults.length, 'imagens');
        console.log(`📊 Total de imagens:`, allUploadedFiles.length + successfulResults.length);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao adicionar batch de imagens:', error);
      return false;
    }
  };

  const removeImage = (index: number) => {
    setAllUploadedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const combineAllTexts = (): string => {
    return allUploadedFiles
      .map((result, index) => {
        return `--- Imagem ${index + 1} (${result.file.name}) ---\n${result.extractedText}`;
      })
      .join('\n\n');
  };

  const getUploadStats = () => {
    return {
      totalImages: allUploadedFiles.length,
      totalBatches: currentBatch - 1,
      remainingSlots: getRemainingSlots(),
      maxBatchSize: getCurrentBatchSize(),
      totalSize: allUploadedFiles.reduce((total, file) => total + file.file.size, 0),
      averageTextLength: allUploadedFiles.length > 0 
        ? allUploadedFiles.reduce((total, file) => total + file.extractedText.length, 0) / allUploadedFiles.length 
        : 0
    };
  };

  const finalizeUpload = async (): Promise<{ success: boolean; combinedText?: string; uploadId?: string }> => {
    if (allUploadedFiles.length === 0) {
      return { success: false };
    }

    try {
      setIsCompleteUpload(true);
      const combinedText = combineAllTexts();
      
      // Simular salvamento final (você pode adaptar conforme sua implementação)
      console.log('📄 Texto combinado:', combinedText.length, 'caracteres');
      console.log('📊 Estatísticas finais:', getUploadStats());
      
      return {
        success: true,
        combinedText,
        uploadId: `upload_${Date.now()}` // Substitua pela lógica real de salvamento
      };
    } catch (error) {
      console.error('❌ Erro ao finalizar upload:', error);
      return { success: false };
    } finally {
      setIsCompleteUpload(false);
    }
  };

  const resetAllUploads = () => {
    setAllUploadedFiles([]);
    setCurrentBatch(1);
    setIsCompleteUpload(false);
    resetUpload();
  };

  return {
    // Estado
    allUploadedFiles,
    currentBatch,
    isCompleteUpload,
    uploadResults, // Para o batch atual
    isProcessing,
    
    // Métodos principais
    addImageBatch,
    removeImage,
    finalizeUpload,
    resetAllUploads,
    
    // Informações úteis
    canAddMoreImages,
    getRemainingSlots,
    getCurrentBatchSize,
    getUploadStats,
    combineAllTexts
  };
};
