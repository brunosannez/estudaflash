
import { Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import type { ImageUploadResult } from '@/types/upload';

interface ImageStatusIndicatorProps {
  status: ImageUploadResult['status'];
}

const ImageStatusIndicator = ({ status }: ImageStatusIndicatorProps) => {
  switch (status) {
    case 'pending':
      return <div className="absolute top-2 right-2 w-6 h-6 bg-muted/500 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-card rounded-full"></div>
      </div>;
    case 'uploading':
      return <div className="absolute top-2 right-2 w-6 h-6 bg-primary/50 rounded-full flex items-center justify-center">
        <Loader2 className="w-4 h-4 text-white animate-spin" />
      </div>;
    case 'extracting':
      return <div className="absolute top-2 right-2 w-6 h-6 bg-primary/50 rounded-full flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-white" />
      </div>;
    case 'completed':
      return <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-white" />
      </div>;
    case 'error':
      return <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
        <AlertCircle className="w-4 h-4 text-white" />
      </div>;
    default:
      return null;
  }
};

export default ImageStatusIndicator;
