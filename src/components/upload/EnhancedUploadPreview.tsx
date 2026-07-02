import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, FileArchive, Image as ImageIcon, Hash, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { ProcessedFile } from '@/hooks/useEnhancedUpload';

interface EnhancedUploadPreviewProps {
  files: ProcessedFile[];
  onRemoveFile: (index: number) => void;
  disabled?: boolean;
}

const EnhancedUploadPreview: React.FC<EnhancedUploadPreviewProps> = ({
  files,
  onRemoveFile,
  disabled = false
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPreviewUrl = (file: File): string => {
    try {
      return URL.createObjectURL(file);
    } catch {
      return '';
    }
  };

  const zipFiles = files.filter(f => f.isFromZip);
  const directFiles = files.filter(f => !f.isFromZip);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Summary */}
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Arquivos Selecionados ({files.length})
          </h3>
          <div className="text-sm text-muted-foreground">
            Total: {formatFileSize(files.reduce((acc, f) => acc + f.file.size, 0))}
          </div>
        </div>

        {/* ZIP Files Section */}
        {zipFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-medium text-primary">
              <FileArchive className="w-4 h-4" />
              <span>Extraídas de ZIP ({zipFiles.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {zipFiles.map((processedFile, index) => (
                <FilePreview
                  key={`zip-${index}`}
                  processedFile={processedFile}
                  displayOrder={index + 1}
                  totalFiles={zipFiles.length}
                  onRemove={() => onRemoveFile(files.indexOf(processedFile))}
                  disabled={disabled}
                  isZip={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Direct Files Section */}
        {directFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-medium text-primary">
              <ImageIcon className="w-4 h-4" />
              <span>Imagens Diretas ({directFiles.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {directFiles.map((processedFile, index) => (
                <FilePreview
                  key={`direct-${index}`}
                  processedFile={processedFile}
                  displayOrder={zipFiles.length + index + 1}
                  totalFiles={files.length}
                  onRemove={() => onRemoveFile(files.indexOf(processedFile))}
                  disabled={disabled}
                  isZip={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Helpful tip */}
        <div className="bg-primary/5 border border-blue-200 rounded-lg p-3 text-sm">
          <div className="flex items-start space-x-2">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-blue-800">
              <strong>Ordem detectada automaticamente:</strong> As imagens estão ordenadas 
              {files.some(f => f.pageNumber) ? ' pelos números de página detectados nos nomes dos arquivos' : ' alfabeticamente'}.
              {files.some(f => f.pageNumber) && (
                <span className="block mt-1 text-xs text-primary">
                  ✓ Números de página detectados em {files.filter(f => f.pageNumber).length} de {files.length} imagens
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const FilePreview: React.FC<{
  processedFile: ProcessedFile;
  displayOrder: number;
  totalFiles: number;
  onRemove: () => void;
  disabled: boolean;
  isZip: boolean;
}> = ({ processedFile, displayOrder, totalFiles, onRemove, disabled, isZip }) => {
  const previewUrl = processedFile.file.type.startsWith('image/') 
    ? URL.createObjectURL(processedFile.file) 
    : '';

  const bgColor = isZip ? 'bg-primary/5' : 'bg-primary/5';
  const borderColor = isZip ? 'border-primary/20' : 'border-blue-200';
  const textColor = isZip ? 'text-primary' : 'text-primary';
  const iconColor = isZip ? 'text-primary' : 'text-primary';

  return (
    <Card className={`relative group overflow-hidden ${bgColor} ${borderColor}`}>
      {/* Preview Image */}
      <div className="aspect-square bg-white/50 flex items-center justify-center relative">
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt={processedFile.originalPath}
            className="w-full h-full object-contain"
            onLoad={() => URL.revokeObjectURL(previewUrl)}
          />
        ) : (
          <FileArchive className={`w-12 h-12 ${iconColor} opacity-30`} />
        )}
        
        {/* Page number badge */}
        <div className={`absolute top-2 left-2 ${bgColor} border ${borderColor} rounded-full px-2 py-1 text-xs font-bold ${textColor} shadow-sm`}>
          Pág. {displayOrder}
        </div>
      </div>
      
      {/* File Info */}
      <div className="p-3 space-y-1">
        <div className="flex items-center space-x-1">
          <Hash className={`w-3 h-3 ${iconColor}`} />
          <span className={`text-xs font-medium ${textColor}`}>
            Página {displayOrder} de {totalFiles}
          </span>
          {processedFile.pageNumber !== undefined && (
            <span className="text-xs text-green-600 font-semibold ml-auto">
              ✓ P{processedFile.pageNumber}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate" title={processedFile.originalPath}>
          {processedFile.originalPath}
        </p>
        <p className="text-xs text-muted-foreground">
          {(processedFile.file.size / 1024).toFixed(1)} KB
        </p>
      </div>

      {/* Remove Button */}
      {!disabled && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto shadow-lg"
          onClick={onRemove}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </Card>
  );
};

export default EnhancedUploadPreview;
