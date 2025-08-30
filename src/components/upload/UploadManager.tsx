
import { useState, useRef } from 'react';
import { useMultipleUpload } from '@/hooks/useMultipleUpload';
import { useBatchUpload } from '@/hooks/useBatchUpload';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useUploadManager = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { uploadMultipleImages, uploadResults, isProcessing, resetUpload } = useMultipleUpload();
  const { 
    processBatchUpload, 
    isProcessing: isBatchProcessing, 
    batchProgress, 
    allResults: batchResults,
    resetBatch,
    getBatchSize
  } = useBatchUpload();

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum arquivo foi detectado. Tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    handleFiles(files);
  }

  function handleFiles(files: File[]) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhuma imagem válida foi selecionada. Por favor, selecione arquivos de imagem (JPG, PNG, etc.).",
        variant: "destructive",
      });
      return;
    }
    
    // Aceitar todas as imagens válidas sem limitação
    console.log('📁 Arquivos selecionados:');
    imageFiles.forEach((file, index) => {
      console.log(`📄 Arquivo ${index + 1}: ${file.name} - ${(file.size / (1024 * 1024)).toFixed(2)}MB (${file.size} bytes)`);
    });
    
    if (imageFiles.length > 1) {
      toast({
        title: "Múltiplas imagens detectadas",
        description: `${imageFiles.length} imagens serão processadas em ordem para criar o resumo completo.`,
      });
    }
    
    setSelectedFiles(imageFiles);
    resetUpload();
  }

  function handleFileButtonClick() {
    fileInputRef.current?.click();
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    handleFiles(Array.from(files));
  }

  async function handleProcessImages() {
    if (selectedFiles.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma imagem antes de processar.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('🚀 Iniciando processamento de imagens:');
    selectedFiles.forEach((file, index) => {
      console.log(`📄 Arquivo ${index + 1}: ${file.name} - ${(file.size / (1024 * 1024)).toFixed(2)}MB (${file.size} bytes)`);
    });

    // Verificar se o usuário está autenticado ANTES de processar
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Usuário não autenticado:', authError);
        toast({
          title: "Erro de Autenticação",
          description: "Faça login novamente para continuar.",
          variant: "destructive",
        });
        return;
      }
      console.log('✅ Usuário autenticado:', user.id);
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      toast({
        title: "Erro de Conexão",
        description: "Verifique sua conexão com a internet.",
        variant: "destructive",
      });
      return;
    }
    
    const batchSize = getBatchSize();
    const needsBatchProcessing = selectedFiles.length > batchSize || batchSize < selectedFiles.length;
    
    try {
      let result;
      
      if (needsBatchProcessing && selectedFiles.length > 5) {
        // Usar processamento em lotes para muitas imagens
        console.log(`📦 Usando processamento em lotes para ${selectedFiles.length} imagens`);
        result = await processBatchUpload(selectedFiles);
      } else {
        // Usar processamento normal para poucas imagens
        console.log(`📤 Usando processamento normal para ${selectedFiles.length} imagens`);
        result = await uploadMultipleImages(selectedFiles);
      }
      
      setUploadResult(result);
      setSelectedFiles([]);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('❌ Erro no processamento das imagens:', error);
      
      // Mensagens de erro mais específicas
      let errorMessage = "Erro ao processar imagens.";
      if (error instanceof Error) {
        if (error.message.includes('créditos')) {
          errorMessage = error.message;
        } else if (error.message.includes('autenticação') || error.message.includes('login')) {
          errorMessage = "Sessão expirada. Faça login novamente.";
        } else if (error.message.includes('conexão') || error.message.includes('network')) {
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
        } else if (error.message.includes('grande') || error.message.includes('size')) {
          errorMessage = "Uma ou mais imagens são muito grandes. Use imagens menores.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Erro no Processamento",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }

  function resetAllUploads() {
    setSelectedFiles([]);
    setUploadResult(null);
    resetUpload();
    resetBatch();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function removeFile(index: number) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }

  function handleChooseOther() {
    setSelectedFiles([]);
    resetUpload();
    resetBatch();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleAddMoreFiles = (newFiles: File[]) => {
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhuma imagem válida foi detectada nos arquivos adicionais.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles(prev => {
      const combined = [...prev, ...imageFiles];
      console.log(`📁 Adicionadas ${imageFiles.length} imagens. Total: ${combined.length}`);
      
      toast({
        title: "Imagens adicionadas",
        description: `${imageFiles.length} imagens foram adicionadas. Total: ${combined.length} imagens para processar.`,
      });
      
      return combined;
    });
  };

  return {
    dragActive,
    selectedFiles,
    uploadResult,
    fileInputRef,
    uploadResults,
    isProcessing: isProcessing || isBatchProcessing,
    batchProgress,
    batchResults,
    handleDrag,
    handleDrop,
    handleFileButtonClick,
    handleFileInput,
    handleProcessImages,
    resetAllUploads,
    removeFile,
    handleChooseOther,
    handleAddMoreFiles,
    setDragActive,
    getBatchSize
  };
};
