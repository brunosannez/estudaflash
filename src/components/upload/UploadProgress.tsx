
import { Progress } from '@/components/ui/progress';

interface UploadProgressProps {
  progress: number;
}

const UploadProgress = ({ progress }: UploadProgressProps) => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg border z-50">
      <div className="text-center mb-2">
        <p className="text-sm font-medium">Processando imagens...</p>
        <p className="text-xs text-gray-600">{Math.round(progress)}% concluído</p>
      </div>
      <Progress value={progress} className="w-64" />
    </div>
  );
};

export default UploadProgress;
