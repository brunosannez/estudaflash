import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, FileArchive, Image as ImageIcon, Hash } from 'lucide-react';
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
          <h3 className="text-lg font-semibold text-gray-800">
            Arquivos Selecionados ({files.length})
          </h3>
          <div className="text-sm text-gray-600">
            Total: {formatFileSize(files.reduce((acc, f) => acc + f.file.size, 0))}
          </div>
        </div>

        {/* ZIP Files Section */}
        {zipFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-medium text-purple-700">
              <FileArchive className="w-4 h-4" />
              <span>Extraídas de ZIP ({zipFiles.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {zipFiles.map((processedFile, index) => (
                <ZipFilePreview
                  key={`zip-${index}`}
                  processedFile={processedFile}
                  onRemove={() => onRemoveFile(files.indexOf(processedFile))}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        )}

        {/* Direct Files Section */}
        {directFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-medium text-blue-700">
              <ImageIcon className="w-4 h-4" />
              <span>Imagens Diretas ({directFiles.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {directFiles.map((processedFile, index) => (
                <DirectFilePreview
                  key={`direct-${index}`}
                  processedFile={processedFile}
                  onRemove={() => onRemoveFile(files.indexOf(processedFile))}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const ZipFilePreview: React.FC<{
  processedFile: ProcessedFile;
  onRemove: () => void;
  disabled: boolean;
}> = ({ processedFile, onRemove, disabled }) => {
  const previewUrl = processedFile.file.type.startsWith('image/') 
    ? URL.createObjectURL(processedFile.file) 
    : '';

  return (
    <Card className="relative group overflow-hidden bg-purple-50 border-purple-200">
      <div className="aspect-square bg-purple-100 flex items-center justify-center">
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt={processedFile.originalPath}
            className="w-full h-full object-contain"
            onLoad={() => URL.revokeObjectURL(previewUrl)}
          />
        ) : (
          <FileArchive className="w-12 h-12 text-purple-400" />
        )}
      </div>
      
      <div className="p-3 space-y-1">
        <div className="flex items-center space-x-1">
          <Hash className="w-3 h-3 text-purple-600" />
          <span className="text-xs font-medium text-purple-700">
            Página {processedFile.order + 1}
          </span>
        </div>
        <p className="text-xs text-gray-600 truncate" title={processedFile.originalPath}>
          {processedFile.originalPath}
        </p>
        <p className="text-xs text-gray-500">
          {(processedFile.file.size / 1024).toFixed(1)} KB
        </p>
      </div>

      {!disabled && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
          onClick={onRemove}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </Card>
  );
};

const DirectFilePreview: React.FC<{
  processedFile: ProcessedFile;
  onRemove: () => void;
  disabled: boolean;
}> = ({ processedFile, onRemove, disabled }) => {
  const previewUrl = URL.createObjectURL(processedFile.file);

  return (
    <Card className="relative group overflow-hidden bg-blue-50 border-blue-200">
      <div className="aspect-square bg-blue-100 flex items-center justify-center">
        <img 
          src={previewUrl} 
          alt={processedFile.file.name}
          className="w-full h-full object-contain"
          onLoad={() => URL.revokeObjectURL(previewUrl)}
        />
      </div>
      
      <div className="p-3 space-y-1">
        <div className="flex items-center space-x-1">
          <Hash className="w-3 h-3 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">
            Página {processedFile.order + 1}
          </span>
        </div>
        <p className="text-xs text-gray-600 truncate" title={processedFile.file.name}>
          {processedFile.file.name}
        </p>
        <p className="text-xs text-gray-500">
          {(processedFile.file.size / 1024).toFixed(1)} KB
        </p>
      </div>

      {!disabled && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
          onClick={onRemove}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </Card>
  );
};

export default EnhancedUploadPreview;