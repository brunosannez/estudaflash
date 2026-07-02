
import { X } from 'lucide-react';
import { ImageUploadResult } from '@/types/upload';
import ImageStatusIndicator from './ImageStatusIndicator';
import { useEffect, useState } from 'react';

interface ImagePreviewProps {
  file: File;
  result?: ImageUploadResult;
  onRemove: () => void;
  isProcessing: boolean;
  showRemoveButton: boolean;
}

const ImagePreview = ({ file, result, onRemove, isProcessing, showRemoveButton }: ImagePreviewProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    let objectUrl: string | null = null;
    try {
      objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
    } catch (error) {
      console.error(`❌ Erro ao criar URL para imagem:`, error);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file]);

  if (!imageUrl) {
    return (
      <div className="relative">
        <div className="w-full h-24 bg-red-100 border border-red-300 rounded-lg flex items-center justify-center">
          <span className="text-red-600 text-xs">Erro ao carregar</span>
        </div>
        <p className="text-xs text-red-600 mt-1">{file.name}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative rounded-lg overflow-hidden border">
        <img
          src={imageUrl}
          alt={`Preview ${file.name}`}
          className="w-full h-24 object-cover"
        />
        {showRemoveButton && (
          <button
            onClick={onRemove}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
            disabled={isProcessing}
          >
            <X className="w-3 h-3" />
          </button>
        )}
        {result && <ImageStatusIndicator status={result.status} />}
      </div>
      <p className="text-xs text-muted-foreground mt-1 truncate">{file.name}</p>
      {result?.error && (
        <p className="text-xs text-red-600 mt-1">{result.error}</p>
      )}
    </div>
  );
};

export default ImagePreview;
