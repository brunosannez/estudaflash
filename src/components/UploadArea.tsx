
import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMultipleUpload } from '@/hooks/useMultipleUpload';
import ExtractedTextDisplay from './ExtractedTextDisplay';
import AuthGuard from './AuthGuard';
import { useToast } from '@/hooks/use-toast';
import HowItWorks from './upload/HowItWorks';
import Dropzone from './upload/Dropzone';
import FileList from './upload/FileList';
import UploadActions from './upload/UploadActions';

const MAX_IMAGES = 5;

const UploadArea = () => {
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
    
    const limitedFiles = imageFiles.slice(0, MAX_IMAGES);
    
    if (limitedFiles.length !== imageFiles.length) {
      toast({
        title: "Aviso",
        description: `Apenas as primeiras ${MAX_IMAGES} imagens foram selecionadas.`,
      });
    }
    
    setSelectedFiles(limitedFiles);
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

  function handleGenerateSummary() {
    console.log('📝 Gerar resumo para:', uploadResult);
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
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  if (uploadResult) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Resultado do Upload</h2>
          <Button variant="outline" onClick={resetAllUploads}>
            Novo Upload
          </Button>
        </div>
        <ExtractedTextDisplay 
          uploadData={uploadResult} 
          onGenerateSummary={handleGenerateSummary}
        />
      </div>
    );
  }

  const showDropzone = selectedFiles.length === 0 && uploadResults.length === 0;

  return (
    <AuthGuard>
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                className="hidden"
                disabled={isProcessing}
              />
              {showDropzone ? (
                <Dropzone
                  onFileButtonClick={handleFileButtonClick}
                  isProcessing={isProcessing}
                />
              ) : (
                <div className="space-y-4">
                  <FileList
                    files={selectedFiles}
                    uploadResults={uploadResults}
                    onRemoveFile={removeFile}
                    isProcessing={isProcessing}
                  />
                  <UploadActions
                    selectedFiles={selectedFiles}
                    onProcessImages={handleProcessImages}
                    isProcessing={isProcessing}
                    onChooseOther={handleChooseOther}
                    onAddMoreFiles={handleAddMoreFiles}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <HowItWorks />
      </div>
    </AuthGuard>
  );
};

export default UploadArea;
