import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useUsageValidation } from '@/hooks/useUsageValidation';
import { useZipExtractor } from './useZipExtractor';
import { useSequentialOCR } from './useSequentialOCR';
import { useSummaryGenerator } from './useSummaryGenerator';

export interface ProcessedFile {
  file: File;
  originalPath: string;
  isFromZip: boolean;
  order: number;
}

export interface UploadProgress {
  stage: 'preparing' | 'extracting' | 'uploading' | 'ocr' | 'summary' | 'complete';
  progress: number;
  current: number;
  total: number;
  message: string;
  currentBatch?: number;
  totalBatches?: number;
  successfulImages?: number;
  failedImages?: number;
}

export interface UploadResults {
  totalImages: number;
  totalPages: number;
  summaryLength: number;
  summaryId: string;
}

export const useEnhancedUpload = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    stage: 'preparing',
    progress: 0,
    current: 0,
    total: 0,
    message: 'Preparando...'
  });
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<UploadResults | null>(null);

  const { user } = useAuth();
  const { checkCanProceed, incrementUsage } = useUsageValidation();
  const { extractFromZip } = useZipExtractor();
  const { processImages } = useSequentialOCR();
  const { generateSummary } = useSummaryGenerator();

  const updateProgress = useCallback((update: Partial<UploadProgress>) => {
    setProgress(prev => ({ ...prev, ...update }));
  }, []);

  const addFiles = useCallback(async (newFiles: File[]) => {
    console.log('📁 Adding files:', newFiles.length);
    setError(null);
    
    try {
      const processedFiles: ProcessedFile[] = [];
      let orderCounter = files.length;

      for (const file of newFiles) {
        if (file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip')) {
          console.log('📦 Processing ZIP file:', file.name);
          updateProgress({
            stage: 'extracting',
            message: `Extraindo ${file.name}...`,
            progress: 10
          });

          const extractedImages = await extractFromZip(file);
          
          // Ordenar imagens extraídas por nome
          extractedImages.sort((a, b) => a.originalPath.localeCompare(b.originalPath));
          
          extractedImages.forEach(img => {
            processedFiles.push({
              file: img.file,
              originalPath: img.originalPath,
              isFromZip: true,
              order: orderCounter++
            });
          });
          
          console.log(`✅ Extracted ${extractedImages.length} images from ZIP`);
        } else if (file.type.startsWith('image/')) {
          console.log('🖼️ Adding direct image:', file.name);
          processedFiles.push({
            file,
            originalPath: file.name,
            isFromZip: false,
            order: orderCounter++
          });
        } else {
          console.warn('⚠️ Unsupported file type:', file.type);
          toast.warning(`Arquivo não suportado: ${file.name}`, {
            description: 'Apenas imagens e arquivos ZIP são aceitos.'
          });
        }
      }

      // Validar limite total
      const totalFiles = files.length + processedFiles.length;
      if (totalFiles > 20) {
        toast.error('Limite excedido', {
          description: `Máximo de 20 imagens. Você selecionou ${totalFiles}.`
        });
        return;
      }

      // Adicionar arquivos processados
      setFiles(prev => [...prev, ...processedFiles].sort((a, b) => a.order - b.order));
      
      if (processedFiles.length > 0) {
        toast.success(`${processedFiles.length} arquivo(s) adicionado(s)`, {
          description: `Total: ${files.length + processedFiles.length} imagens`
        });
      }

    } catch (error: any) {
      console.error('❌ Error processing files:', error);
      setError(error.message);
      toast.error('Erro ao processar arquivos', {
        description: error.message
      });
    } finally {
      updateProgress({ stage: 'preparing', progress: 0, message: 'Preparando...' });
    }
  }, [files.length, extractFromZip, updateProgress]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError(null);
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setError(null);
    setResults(null);
  }, []);

  const processFiles = useCallback(async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (files.length === 0) {
      toast.error('Nenhum arquivo selecionado');
      return;
    }

    // Verificar limites de uso
    const canProceed = await checkCanProceed('uploads');
    if (!canProceed) {
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults(null);

    try {
      console.log('🚀 Starting enhanced upload process for', files.length, 'files');

      // Etapa 1: Upload e OCR das imagens
      updateProgress({
        stage: 'uploading',
        progress: 0,
        current: 0,
        total: files.length,
        message: 'Enviando imagens...'
      });

      const ocrResults = await processImages(
        files.map(f => f.file),
        (current, total, message) => {
          const batchSize = 3;
          const currentBatch = Math.floor(current / batchSize) + 1;
          const totalBatches = Math.ceil(total / batchSize);
          const successful = current; // Current represents completed images
          const failed = 0; // This would need to be tracked in processImages
          
          updateProgress({
            stage: current <= total * 0.3 ? 'uploading' : 'ocr',
            progress: Math.round((current / total) * 80),
            current,
            total,
            message,
            currentBatch: totalBatches > 1 ? currentBatch : undefined,
            totalBatches: totalBatches > 1 ? totalBatches : undefined,
            successfulImages: successful,
            failedImages: failed
          });
        }
      );

      console.log('✅ OCR processing complete:', ocrResults.length, 'results');

      // Etapa 2: Combinar textos em ordem
      updateProgress({
        stage: 'summary',
        progress: 85,
        message: 'Combinando textos...'
      });

      const combinedText = ocrResults
        .filter(result => result.extractedText && result.extractedText.trim())
        .map((result, index) => {
          const pageNum = index + 1;
          return `=== PÁGINA ${pageNum} ===\n${result.extractedText}\n`;
        })
        .join('\n');

      if (!combinedText.trim()) {
        throw new Error('Nenhum texto foi extraído das imagens. Verifique se as imagens contêm texto legível.');
      }

      console.log('📄 Combined text length:', combinedText.length, 'characters');

      // Etapa 3: Gerar resumo
      updateProgress({
        stage: 'summary',
        progress: 90,
        message: 'Gerando resumo inteligente...'
      });

      const summaryResult = await generateSummary(combinedText, ocrResults);

      // Etapa 4: Incrementar uso
      await incrementUsage('uploads');

      // Concluído
      updateProgress({
        stage: 'complete',
        progress: 100,
        message: 'Processamento concluído!'
      });

      setResults({
        totalImages: files.length,
        totalPages: ocrResults.length,
        summaryLength: summaryResult.summary.length,
        summaryId: summaryResult.id
      });

      toast.success('Upload concluído!', {
        description: `Resumo gerado com ${ocrResults.length} páginas processadas.`
      });

    } catch (error: any) {
      console.error('❌ Enhanced upload error:', error);
      setError(error.message);
      toast.error('Erro no processamento', {
        description: error.message
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user, files, checkCanProceed, processImages, generateSummary, incrementUsage, updateProgress]);

  const resetProcess = useCallback(() => {
    setFiles([]);
    setIsProcessing(false);
    setProgress({
      stage: 'preparing',
      progress: 0,
      current: 0,
      total: 0,
      message: 'Preparando...'
    });
    setError(null);
    setResults(null);
  }, []);

  return {
    files,
    isProcessing,
    progress: progress.progress,
    currentStep: progress.message,
    stage: progress.stage,
    currentBatch: progress.currentBatch,
    totalBatches: progress.totalBatches,
    successfulImages: progress.successfulImages,
    failedImages: progress.failedImages,
    results,
    error,
    addFiles,
    removeFile,
    clearFiles,
    processFiles,
    resetProcess
  };
};