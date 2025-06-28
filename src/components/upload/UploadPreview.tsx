
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadPreviewProps {
  file: File;
  index: number;
  onRemove: (index: number) => void;
}

const UploadPreview = ({ file, index, onRemove }: UploadPreviewProps) => {
  const previewUrl = URL.createObjectURL(file);

  return (
    <div className="relative group">
      <img
        src={previewUrl}
        alt={`Preview ${index + 1}`}
        className="w-full h-32 object-cover rounded-lg border shadow-sm"
      />
      <Button
        onClick={() => onRemove(index)}
        variant="destructive"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </Button>
      <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
    </div>
  );
};

export default UploadPreview;
