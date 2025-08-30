
import { useState, useRef } from 'react';
import { useMultipleUpload } from '@/hooks/useMultipleUpload';
import { useToast } from '@/hooks/use-toast';

export const useUploadManager = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { uploadMultipleImages, uploadResults, isProcessing, resetUpload } = useMultipleUpload();

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
    
    try {
      const result = await uploadMultipleImages(selectedFiles);
      setUploadResult(result);
      setSelectedFiles([]);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('❌ Erro no processamento das imagens no componente UploadArea:', error);
    }
  }

  function resetAllUploads() {
    setSelectedFiles([]);
    setUploadResult(null);
    resetUpload();
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
    isProcessing,
    handleDrag,
    handleDrop,
    handleFileButtonClick,
    handleFileInput,
    handleProcessImages,
    resetAllUploads,
    removeFile,
    handleChooseOther,
    handleAddMoreFiles,
    setDragActive
  };
};
