
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

  async function handleFiles(files: File[]) {
    console.log('📁 Processando arquivos recebidos:', files.map(f => f.name));
    
    try {
      // SIMPLIFICAÇÃO: Processar apenas imagens diretas por enquanto
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      
      if (imageFiles.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhuma imagem válida foi encontrada. Selecione arquivos de imagem (JPG, PNG, WebP, GIF).",
          variant: "destructive",
        });
        return;
      }
      
      console.log('📁 Imagens válidas encontradas:', imageFiles.length);
      imageFiles.forEach((file, index) => {
        console.log(`📄 Imagem ${index + 1}: ${file.name} - ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      });
      
      if (imageFiles.length > 1) {
        toast({
          title: "Múltiplas Imagens",
          description: `${imageFiles.length} imagens serão processadas para criar um resumo completo.`,
        });
      }
      
      setSelectedFiles(imageFiles);
      resetUpload();
      
    } catch (error) {
      console.error('❌ Erro ao processar arquivos:', error);
      toast({
        title: "Erro no Processamento",
        description: error instanceof Error ? error.message : "Erro ao processar os arquivos selecionados.",
        variant: "destructive",
      });
    }
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
    console.log('📋 Resumo da operação:', {
      totalFiles: selectedFiles.length,
      totalSizeBytes: selectedFiles.reduce((total, file) => total + file.size, 0),
      totalSizeMB: (selectedFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(2),
      files: selectedFiles.map((file, index) => ({
        index: index + 1,
        name: file.name,
        sizeBytes: file.size,
        sizeMB: (file.size / (1024 * 1024)).toFixed(2),
        type: file.type
      }))
    });

    // Verificar se o usuário está autenticado ANTES de processar
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Usuário não autenticado:', authError);
        toast({
          title: "Erro de Autenticação",
          description: "Sua sessão expirou. Faça login novamente para continuar.",
          variant: "destructive",
        });
        return;
      }
      console.log('✅ Usuário autenticado:', user.id);
      console.log('📧 Email do usuário:', user.email);
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível verificar sua autenticação. Verifique sua conexão com a internet.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      let result;
      
      // SIMPLIFICAÇÃO: Usar sempre processamento normal por enquanto
      console.log(`📤 Processando ${selectedFiles.length} imagens...`);
      result = await uploadMultipleImages(selectedFiles);
      
      setUploadResult(result);
      setSelectedFiles([]);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('❌ Erro no processamento das imagens:', error);
      console.error('📊 Estatísticas do erro:', {
        selectedFilesCount: selectedFiles.length,
        processingType: 'normal',
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Mensagens de erro mais específicas e úteis
      let errorMessage = "Erro ao processar imagens.";
      let errorTitle = "Erro no Processamento";
      
      if (error instanceof Error) {
        if (error.message.includes('créditos') || error.message.includes('credits')) {
          errorMessage = error.message;
          errorTitle = "Créditos Insuficientes";
        } else if (error.message.includes('autenticação') || error.message.includes('login') || error.message.includes('não autenticado')) {
          errorMessage = "Sua sessão expirou. Faça login novamente e tente outra vez.";
          errorTitle = "Sessão Expirada";
        } else if (error.message.includes('conexão') || error.message.includes('network') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente em alguns segundos.";
          errorTitle = "Erro de Conexão";
        } else if (error.message.includes('grande') || error.message.includes('size') || error.message.includes('10MB')) {
          errorMessage = "Uma ou mais imagens são muito grandes. Use imagens menores que 10MB cada.";
          errorTitle = "Imagens Muito Grandes";
        } else if (error.message.includes('formato') || error.message.includes('inválid') || error.message.includes('invalid')) {
          errorMessage = "Formato de imagem não suportado. Use JPG, PNG, WebP ou GIF.";
          errorTitle = "Formato Inválido";
        } else if (error.message.includes('timeout') || error.message.includes('tempo limite')) {
          errorMessage = "Processo demorou muito. Tente com menos imagens ou imagens menores.";
          errorTitle = "Tempo Limite Excedido";
        } else if (error.message.includes('API') || error.message.includes('503') || error.message.includes('502')) {
          errorMessage = "Serviço temporariamente indisponível. Tente novamente em alguns minutos.";
          errorTitle = "Serviço Indisponível";
        } else {
          errorMessage = `${error.message}\n\nSe o problema persistir, tente com menos imagens ou contate o suporte.`;
          errorTitle = "Erro no Processamento";
        }
      }
      
      toast({
        title: errorTitle,
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

  const handleChooseOther = () => {
    setSelectedFiles([]);
    resetUpload();
    resetBatch();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Função de teste para OCR
  const testOcrFunction = async () => {
    try {
      console.log('🧪 Testando conectividade com OCR function...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Faça login para testar o OCR.",
          variant: "destructive",
        });
        return;
      }

      // URL de teste (imagem pequena)
      const testImageUrl = 'https://via.placeholder.com/300x200/000000/FFFFFF?text=Test+OCR';
      
      console.log('📞 Calling OCR function with test image...');
      const { data, error } = await supabase.functions.invoke('extract-text-from-image', {
        body: { 
          imageUrl: testImageUrl, 
          userId: user.id 
        }
      });

      if (error) {
        console.error('❌ OCR test failed:', error);
        toast({
          title: "Teste OCR - Falhou",
          description: `Erro: ${error.message}`,
          variant: "destructive",
        });
      } else if (data?.success) {
        console.log('✅ OCR test successful:', data);
        toast({
          title: "Teste OCR - Sucesso!",
          description: "A função OCR está funcionando corretamente.",
        });
      } else {
        console.error('❌ OCR test returned error:', data);
        toast({
          title: "Teste OCR - Falhou",
          description: data?.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ OCR test exception:', error);
      toast({
        title: "Teste OCR - Erro",
        description: "Erro ao testar função OCR.",
        variant: "destructive",
      });
    }
  };

  const handleAddMoreFiles = async (newFiles: File[]) => {
    try {
      // SIMPLIFICAÇÃO: Processar apenas imagens diretas
      const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
      
      if (imageFiles.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhuma imagem válida foi encontrada nos arquivos adicionais.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFiles(prev => {
        const combined = [...prev, ...imageFiles];
        console.log(`📁 Adicionadas ${imageFiles.length} imagens. Total: ${combined.length}`);
        
        toast({
          title: "Imagens Adicionadas",
          description: `${imageFiles.length} imagens foram adicionadas. Total: ${combined.length} imagens para processar.`,
        });
        
        return combined;
      });
    } catch (error) {
      console.error('❌ Erro ao adicionar arquivos:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar os arquivos adicionais.",
        variant: "destructive",
      });
    }
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
    getBatchSize,
    testOcrFunction
  };
};
