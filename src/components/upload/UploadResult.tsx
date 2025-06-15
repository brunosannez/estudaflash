
import { Button } from '@/components/ui/button';
import ExtractedTextDisplay from '../ExtractedTextDisplay';

interface UploadResultProps {
  uploadResult: any;
  onResetUploads: () => void;
  onGenerateSummary: () => void;
  onGenerateQuiz: () => void;
}

const UploadResult = ({ uploadResult, onResetUploads, onGenerateSummary, onGenerateQuiz }: UploadResultProps) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Resultado do Upload</h2>
        <Button variant="outline" onClick={onResetUploads}>
          Novo Upload
        </Button>
      </div>
      <ExtractedTextDisplay 
        uploadData={uploadResult} 
        onGenerateSummary={onGenerateSummary}
        onGenerateQuiz={onGenerateQuiz}
      />
    </div>
  );
};

export default UploadResult;
