import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileArchive, Image, AlertCircle } from 'lucide-react';
import { useEnhancedUpload } from '@/hooks/useEnhancedUpload';
import EnhancedUploadDropzone from './EnhancedUploadDropzone';
import EnhancedUploadProgress from './EnhancedUploadProgress';
import EnhancedUploadPreview from './EnhancedUploadPreview';
import { toast } from 'sonner';

const EnhancedUpload = () => {
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
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-800">Upload Concluído!</h2>
              <p className="text-green-600">Resumo gerado com sucesso</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/80 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{results.totalImages}</div>
              <div className="text-sm text-gray-600">Imagens processadas</div>
            </div>
            <div className="bg-white/80 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{results.totalPages}</div>
              <div className="text-sm text-gray-600">Páginas analisadas</div>
            </div>
            <div className="bg-white/80 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{results.summaryLength}</div>
              <div className="text-sm text-gray-600">Caracteres no resumo</div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button onClick={() => window.location.href = '/my-summaries'} className="flex-1">
              Ver Resumo
            </Button>
            <Button variant="outline" onClick={resetProcess}>
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Upload Inteligente
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Envie até 20 imagens ou um arquivo ZIP. Nossa IA irá analisar o conteúdo, 
          manter a ordem das páginas e criar um resumo completo.
        </p>
      </div>

      {/* Informações de suporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-3">
            <Image className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-800">Múltiplas Imagens</h3>
              <p className="text-sm text-blue-600">JPG, PNG, WebP, GIF até 10MB cada</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center space-x-3">
            <FileArchive className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="font-semibold text-purple-800">Arquivos ZIP</h3>
              <p className="text-sm text-purple-600">Extração automática com ordenação inteligente</p>
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
      <Card className="p-6 bg-gradient-to-r from-gray-50 to-blue-50">
        <h3 className="text-lg font-semibold mb-4 text-center">Como funciona:</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">1</div>
            <p className="text-sm text-gray-600">Upload inteligente de imagens ou ZIP</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">2</div>
            <p className="text-sm text-gray-600">OCR avançado extrai texto de cada página</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">3</div>
            <p className="text-sm text-gray-600">Organização sequencial do conteúdo</p>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">4</div>
            <p className="text-sm text-gray-600">Geração de resumo contextual</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedUpload;