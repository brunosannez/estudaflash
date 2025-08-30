import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUsageLimit } from './useUsageLimit';
import { validateFiles } from '@/utils/fileValidator';
import { 
  verifyUserAndBucket, 
  uploadImageToStorage, 
  invokeOcrFunction, 
  saveBatchUploadRecord 
} from '@/services/supabaseUploadService';
import type { ImageUploadResult, SuccessfulUploadResult } from '@/types/upload';

interface BatchProgress {
  currentBatch: number;
  totalBatches: number;
  processedImages: number;
  totalImages: number;
  currentBatchProgress: number;
}

export const useBatchUpload = () => {
  const { toast } = useToast();
  const { checkCanProceed, incrementUsage, usageData } = useUsageLimit();
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const [allResults, setAllResults] = useState<SuccessfulUploadResult[]>([]);
  const [currentBatchResults, setCurrentBatchResults] = useState<ImageUploadResult[]>([]);

  const getBatchSize = () => {
    // Determina tamanho do lote baseado no plano
    if (!usageData) return 8; // Aumentado de 5 para 8
    
    const remainingUploads = (usageData.uploads_limit || 10) - usageData.uploads_realizados;
    
    if (remainingUploads <= 0) {
      return 0; // Sem uploads restantes
    }
    
    // Processo em lotes maiores para melhor performance
    // Planos premium podem processar mais simultaneamente
    const planBasedBatchSize = usageData.uploads_limit > 10 ? 15 : 8;
    return Math.min(planBasedBatchSize, remainingUploads);
  };

  const processBatchUpload = async (files: File[]) => {
    try {
      setIsProcessing(true);
      setAllResults([]);
      
      console.log('=== 🚀 STARTING BATCH UPLOAD PROCESS ===');
      console.log(`📁 Total files to process: ${files.length}`);
      
      // Validar arquivos
      validateFiles(files);
      
      // Verificar autenticação
      const user = await verifyUserAndBucket();
      
      const batchSize = getBatchSize();
      
      if (batchSize === 0) {
        toast({
          title: "Limite Atingido",
          description: "Você atingiu o limite de uploads do seu plano. Faça upgrade para continuar!",
          variant: "destructive",
        });
        return;
      }
      
      const batches = [];
      for (let i = 0; i < files.length; i += batchSize) {
        batches.push(files.slice(i, i + batchSize));
      }
      
      console.log(`📦 Created ${batches.length} batches of max ${batchSize} files each`);
      
      setBatchProgress({
        currentBatch: 0,
        totalBatches: batches.length,
        processedImages: 0,
        totalImages: files.length,
        currentBatchProgress: 0
      });
      
      let allSuccessfulResults: SuccessfulUploadResult[] = [];
      let totalProcessed = 0;
      
      // Processar cada lote
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        console.log(`=== 📦 PROCESSING BATCH ${batchIndex + 1}/${batches.length} (${batch.length} files) ===`);
        
        setBatchProgress(prev => prev ? {
          ...prev,
          currentBatch: batchIndex,
          currentBatchProgress: 0
        } : null);
        
        // Verificar se ainda pode prosseguir com este lote
        const canProceed = await checkCanProceed('uploads');
        if (!canProceed) {
          toast({
            title: "Limite de Plano Atingido",
            description: `Processadas ${totalProcessed} de ${files.length} imagens. Faça upgrade para processar todas!`,
            variant: "destructive",
          });
          break;
        }
        
        // Processar lote atual
        const batchResults: ImageUploadResult[] = [];
        setCurrentBatchResults([]);
        
        for (let i = 0; i < batch.length; i++) {
          const file = batch[i];
          const globalIndex = batchIndex * batchSize + i + 1;
          
          console.log(`=== 🖼️ PROCESSING IMAGE ${i + 1}/${batch.length} (Global: ${globalIndex}/${files.length}): ${file.name} ===`);
          console.log(`📏 File details:`, {
            name: file.name,
            size: file.size,
            sizeMB: (file.size / (1024 * 1024)).toFixed(2),
            type: file.type,
            lastModified: new Date(file.lastModified).toISOString()
          });
          
          try {
            // Update batch progress
            setBatchProgress(prev => prev ? {
              ...prev,
              currentBatchProgress: ((i + 1) / batch.length) * 100,
              processedImages: totalProcessed + i + 1
            } : null);
            
            // Upload phase with retry logic
            console.log(`📤 Starting upload for image ${globalIndex}...`);
            let publicUrl;
            let uploadAttempts = 0;
            const maxUploadAttempts = 2;
            
            while (uploadAttempts < maxUploadAttempts) {
              try {
                publicUrl = await uploadImageToStorage(file, user.id, globalIndex - 1);
                console.log(`✅ Upload successful for image ${globalIndex} (attempt ${uploadAttempts + 1})`);
                break;
              } catch (uploadError) {
                uploadAttempts++;
                console.error(`❌ Upload attempt ${uploadAttempts} failed for image ${globalIndex}:`, uploadError);
                
                if (uploadAttempts >= maxUploadAttempts) {
                  throw uploadError;
                }
                
                // Wait before retry
                console.log(`⏳ Waiting 2 seconds before retry attempt ${uploadAttempts + 1}...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }

            // OCR phase with retry logic
            console.log(`🔍 Starting OCR for image ${globalIndex}...`);
            let extractedText;
            let ocrAttempts = 0;
            const maxOcrAttempts = 2;
            
            while (ocrAttempts < maxOcrAttempts) {
              try {
                extractedText = await invokeOcrFunction(publicUrl!, user.id);
                console.log(`✅ OCR successful for image ${globalIndex} (attempt ${ocrAttempts + 1}), text length: ${extractedText.length}`);
                break;
              } catch (ocrError) {
                ocrAttempts++;
                console.error(`❌ OCR attempt ${ocrAttempts} failed for image ${globalIndex}:`, ocrError);
                
                if (ocrAttempts >= maxOcrAttempts) {
                  throw ocrError;
                }
                
                // Wait before retry
                console.log(`⏳ Waiting 3 seconds before OCR retry attempt ${ocrAttempts + 1}...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
              }
            }
            const result: SuccessfulUploadResult = {
              file,
              status: 'completed',
              imageUrl: publicUrl!,
              extractedText: extractedText!
            };
            
            batchResults.push(result);
            allSuccessfulResults.push(result);
            totalProcessed++;
            
            // Atualizar progresso do lote
            const batchProgressPercent = ((i + 1) / batch.length) * 100;
            setBatchProgress(prev => prev ? {
              ...prev,
              processedImages: totalProcessed,
              currentBatchProgress: batchProgressPercent
            } : null);
            
            setCurrentBatchResults([...batchResults]);
            
          } catch (error) {
            console.error(`❌ Error processing image ${globalIndex}:`, error);
            const errorResult: ImageUploadResult = {
              file,
              status: 'error',
              error: error instanceof Error ? error.message : 'Erro desconhecido'
            };
            batchResults.push(errorResult);
          }
        }
        
        // Incrementar uso após cada lote bem-sucedido
        const successfulInBatch = batchResults.filter(r => r.status === 'completed');
        if (successfulInBatch.length > 0) {
          await incrementUsage('uploads');
        }
        
        console.log(`✅ Batch ${batchIndex + 1} completed. Successful: ${successfulInBatch.length}/${batch.length}`);
        
        // Pequeno delay entre lotes para não sobrecarregar
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setAllResults(allSuccessfulResults);
      
      if (allSuccessfulResults.length === 0) {
        throw new Error('Nenhuma imagem foi processada com sucesso.');
      }
      
      // Salvar registro combinado no banco
      const uploadRecord = await saveBatchUploadRecord(user.id, allSuccessfulResults);
      
      // Se mais de 10 imagens, combinar resumos dos lotes para criar resumo final
      if (allSuccessfulResults.length > 10) {
        console.log('🔄 Iniciando combinação de resumos para grandes lotes...');
        
        // Aqui você poderia implementar a lógica de combinação usando o summariesCombinerService
        // Por enquanto, vamos manter o resumo do primeiro lote como principal
        console.log('💡 Funcionalidade de combinação será implementada na próxima versão');
      }
      
      // Mensagem de conclusão
      const processedCount = allSuccessfulResults.length;
      const totalCount = files.length;
      
      if (processedCount < totalCount) {
        toast({
          title: "Processamento Parcial",
          description: `${processedCount} de ${totalCount} imagens processadas. Limite do plano atingido.`,
        });
      } else {
        toast({
          title: "Sucesso!",
          description: `Todas as ${processedCount} imagens foram processadas com sucesso!`,
        });
      }
      
      console.log('=== ✅ BATCH UPLOAD PROCESS COMPLETED ===');
      return uploadRecord;
      
    } catch (error) {
      console.error('=== ❌ BATCH UPLOAD PROCESS FAILED ===');
      console.error('Error details:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar imagens.";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
      
    } finally {
      setIsProcessing(false);
      setBatchProgress(null);
    }
  };

  const resetBatch = () => {
    setAllResults([]);
    setCurrentBatchResults([]);
    setBatchProgress(null);
    setIsProcessing(false);
  };

  return {
    processBatchUpload,
    isProcessing,
    batchProgress,
    allResults,
    currentBatchResults,
    resetBatch,
    getBatchSize
  };
};