import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileArchive, Image, AlertCircle, Check, Eye } from 'lucide-react';
import { useEnhancedUpload } from '@/hooks/useEnhancedUpload';
import EnhancedUploadDropzone from './EnhancedUploadDropzone';
import EnhancedUploadProgress from './EnhancedUploadProgress';
import EnhancedUploadPreview from './EnhancedUploadPreview';
import { toast } from 'sonner';

const EnhancedUpload = () => {
  const navigate = useNavigate();
  const {
    files,
    isProcessing,
    progress,
    currentStep,
    stage,
    currentBatch,
    totalBatches,
    successfulImages,
    failedImages,
    results,
    error,
    addFiles,
    removeFile,
    clearFiles,
    processFiles,
    resetProcess
  } = useEnhancedUpload();

  const handleFilesSelected = (selectedFiles: File[]) => {
    console.log('📁 Files selected:', selectedFiles.length);
    addFiles(selectedFiles);
  };

  const handleProcessStart = async () => {
    if (files.length === 0) {
      toast.error('Nenhum arquivo selecionado', {
        description: 'Selecione imagens ou um arquivo ZIP para continuar.'
      });
      return;
    }

    console.log('🚀 Starting enhanced upload process...');
    await processFiles();
  };

  // Mostrar resultados se o processamento foi concluído
  if (results) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
        <Card className="p-8 bg-muted/50 border-green-300 shadow-lg">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-800">Upload Concluído com Sucesso!</h2>
              <p className="text-green-600">Seu resumo inteligente foi gerado</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-background/90 p-5 rounded-xl shadow-sm border border-blue-200">
              <div className="text-3xl font-bold text-primary mb-1">{results.totalImages}</div>
              <div className="text-sm text-muted-foreground font-medium">Imagens processadas</div>
            </div>
            <div className="bg-background/90 p-5 rounded-xl shadow-sm border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-1">{results.totalPages}</div>
              <div className="text-sm text-muted-foreground font-medium">Páginas analisadas</div>
            </div>
            <div className="bg-background/90 p-5 rounded-xl shadow-sm border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-1">{Math.round(results.summaryLength / 100)}</div>
              <div className="text-sm text-muted-foreground font-medium">Parágrafos gerados</div>
            </div>
          </div>

          {/* Success message with tips */}
          <div className="bg-background/80 rounded-lg p-4 mb-6 border border-green-200">
            <div className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-foreground/80">
                <p className="font-semibold text-green-800 mb-1">Processamento completo!</p>
                <p>Seu resumo está pronto para visualização. Você pode criar flashcards, 
                gerar quizzes ou mapas mentais a partir deste conteúdo.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate(`/resumo/${results.summaryId}`)} 
              className="flex-1 h-12 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              <Eye className="w-5 h-5 mr-2" />
              Ver Resumo Completo
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/my-summaries')}
              className="h-12"
            >
              Meus Resumos
            </Button>
            <Button 
              variant="outline" 
              onClick={resetProcess}
              className="h-12"
            >
              Novo Upload
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-foreground">
          Upload Inteligente
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Envie até 10 imagens ou um arquivo ZIP. Nossa IA irá detectar automaticamente 
          a ordem das páginas e criar um resumo completo e contextual.
        </p>
      </div>

      {/* Informações de suporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-primary/5 border-blue-200">
          <div className="flex items-center space-x-3">
            <Image className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold text-blue-800">Múltiplas Imagens</h3>
              <p className="text-sm text-primary">JPG, PNG, WebP, GIF até 10MB cada</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center space-x-3">
            <FileArchive className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold text-purple-800">Arquivos ZIP</h3>
              <p className="text-sm text-primary">Extração automática com ordenação inteligente</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Área de upload */}
      <EnhancedUploadDropzone
        onFilesSelected={handleFilesSelected}
        isProcessing={isProcessing}
        disabled={isProcessing}
      />

      {/* Preview dos arquivos */}
      {files.length > 0 && (
        <EnhancedUploadPreview
          files={files}
          onRemoveFile={removeFile}
          disabled={isProcessing}
        />
      )}

      {/* Progresso do processamento */}
      {isProcessing && (
        <EnhancedUploadProgress
          progress={progress}
          currentStep={currentStep}
          totalFiles={files.length}
          stage={stage}
          currentBatch={currentBatch}
          totalBatches={totalBatches}
          successfulImages={successfulImages}
          failedImages={failedImages}
        />
      )}

      {/* Erro */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Erro no processamento</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Ações */}
      <div className="flex justify-center space-x-4">
        {files.length > 0 && !isProcessing && (
          <>
            <Button
              onClick={handleProcessStart}
              className="px-8 py-3"
              disabled={files.length === 0}
            >
              <Upload className="w-5 h-5 mr-2" />
              Processar Arquivos
            </Button>
            <Button variant="outline" onClick={clearFiles}>
              Limpar Seleção
            </Button>
          </>
        )}
      </div>

      {/* Como funciona */}
      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-4 text-center">Como funciona:</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-primary/50 text-white rounded-full flex items-center justify-center mx-auto font-bold">1</div>
            <p className="text-sm text-muted-foreground">Upload inteligente de imagens ou ZIP</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">2</div>
            <p className="text-sm text-muted-foreground">OCR avançado extrai texto de cada página</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-primary/50 text-white rounded-full flex items-center justify-center mx-auto font-bold">3</div>
            <p className="text-sm text-muted-foreground">Organização sequencial do conteúdo</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">4</div>
            <p className="text-sm text-muted-foreground">Geração de resumo contextual</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedUpload;