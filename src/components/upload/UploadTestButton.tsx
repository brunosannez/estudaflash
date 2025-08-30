import { Button } from '@/components/ui/button';
import { TestTube } from 'lucide-react';

interface UploadTestButtonProps {
  onTest: () => void;
  isProcessing: boolean;
}

export const UploadTestButton: React.FC<UploadTestButtonProps> = ({ onTest, isProcessing }) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Button
      onClick={onTest}
      disabled={isProcessing}
      variant="outline"
      size="sm"
      className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
    >
      <TestTube className="h-4 w-4 mr-2" />
      Testar OCR
    </Button>
  );
};