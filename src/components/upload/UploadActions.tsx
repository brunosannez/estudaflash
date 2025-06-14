
import { Loader2, Sparkles, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MAX_IMAGES = 5;

interface UploadActionsProps {
  selectedFiles: File[];
  onProcessImages: () => void;
  isProcessing: boolean;
  onChooseOther: () => void;
  onAddMoreFiles: (files: File[]) => void;
}

const UploadActions = ({
  selectedFiles,
  onProcessImages,
  isProcessing,
  onChooseOther,
  onAddMoreFiles,
}: UploadActionsProps) => {
  
  const handleAddMoreInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const currentCount = selectedFiles.length;
      const availableSlots = MAX_IMAGES - currentCount;
      const filesToAdd = newFiles.slice(0, availableSlots);
      onAddMoreFiles(filesToAdd);
    }
    e.target.value = '';
  }

  return (
    <>
      {selectedFiles.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={onProcessImages}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            size="lg"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processando {selectedFiles.length} imagens...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Extrair Texto de {selectedFiles.length} imagem{selectedFiles.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onChooseOther}
            disabled={isProcessing}
          >
            Escolher Outras
          </Button>
        </div>
      )}

      {selectedFiles.length < MAX_IMAGES && selectedFiles.length > 0 && !isProcessing && (
        <div className="border-t pt-4 mt-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleAddMoreInputChange}
            className="hidden"
            id="additional-files"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('additional-files')?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Adicionar mais imagens ({selectedFiles.length}/{MAX_IMAGES})
          </Button>
        </div>
      )}
    </>
  );
};

export default UploadActions;
