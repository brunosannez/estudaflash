import React from 'react';
import FileList from './FileList';
import UploadActions from './UploadActions';
import { BatchProgressIndicator } from './BatchProgressIndicator';
import { Button } from '@/components/ui/button';
import { Upload, Image } from 'lucide-react';
import type { ImageUploadResult } from '@/types/upload';

interface UploadDropzoneProps {
  dragActive: boolean;
  selectedFiles: File[];
  uploadResults: ImageUploadResult[];
  isProcessing: boolean;
  batchProgress?: {
    currentBatch: number;
    totalBatches: number;
    processedImages: number;
    totalImages: number;
    currentBatchProgress: number;
  } | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileButtonClick: () => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProcessImages: () => void;
  onRemoveFile: (index: number) => void;
  onChooseOther: () => void;
  onAddMoreFiles: (files: File[]) => void;
  getBatchSize?: () => number;
}

const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  dragActive,
  selectedFiles,
  uploadResults,
  isProcessing,
  batchProgress,
  fileInputRef,
  onDrag,
  onDrop,
  onFileButtonClick,
  onFileInput,
  onProcessImages,
  onRemoveFile,
  onChooseOther,
  onAddMoreFiles,
  getBatchSize,
}) => {
  const showDropzone = selectedFiles.length === 0 && uploadResults.length === 0;
  const batchSize = getBatchSize?.() || 8;
  const willUseBatchProcessing = selectedFiles.length > 8;

  return (
    <div className="w-full space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.zip,.rar"
        multiple
        onChange={onFileInput}
        className="hidden"
        disabled={isProcessing}
      />

      {/* Área de Upload */}
      {showDropzone && (
        <div
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
            ${dragActive 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5'
            }
          `}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Arraste suas imagens aqui
              </h3>
              <p className="text-muted-foreground mb-4">
                Ou clique para selecionar arquivos (JPG, PNG, WebP, GIF, ZIP)
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                📚 Sem limite de páginas! Carregue imagens diretamente ou arquivos ZIP com múltiplas imagens para criar seu resumo completo.
              </p>
            </div>
            
            <Button
              onClick={onFileButtonClick}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-medium px-8 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Image className="h-4 w-4 mr-2" />
              Selecionar Imagens
            </Button>
          </div>
        </div>
      )}

      {/* Mostrar arquivos selecionados e ações */}
      {(selectedFiles.length > 0 || uploadResults.length > 0) && (
        <div className="space-y-6">
          {/* Informação sobre processamento em lotes */}
          {willUseBatchProcessing && !isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-bold">📦</span>
                </div>
                <div>
                  <h4 className="text-blue-900 font-semibold mb-1">
                    Processamento em Lotes Detectado
                  </h4>
                  <p className="text-blue-800 text-sm mb-2">
                    Suas {selectedFiles.length} imagens serão processadas em lotes de até {batchSize} por vez, 
                    mantendo a ordem das páginas para criar um resumo organizado.
                  </p>
                  <div className="text-xs text-blue-700">
                    💡 <strong>Novidade:</strong> Agora você pode carregar arquivos ZIP com múltiplas imagens! Faça upgrade para processar lotes ainda maiores simultaneamente.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Indicador de progresso em lotes */}
          <BatchProgressIndicator 
            batchProgress={batchProgress} 
            isProcessing={isProcessing} 
          />

          {/* Lista de arquivos */}
          <FileList
            files={selectedFiles}
            uploadResults={uploadResults}
            isProcessing={isProcessing}
            onRemoveFile={onRemoveFile}
          />

          {/* Ações de upload */}
          <UploadActions
            selectedFiles={selectedFiles}
            onProcessImages={onProcessImages}
            isProcessing={isProcessing}
            onChooseOther={onChooseOther}
            onAddMoreFiles={onAddMoreFiles}
          />
        </div>
      )}
    </div>
  );
};

export default UploadDropzone;