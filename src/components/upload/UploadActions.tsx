
import { Loader2, Sparkles, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      onAddMoreFiles(newFiles);
    }
    e.target.value = '';
  }

  return (
    <div className="space-y-4">
      {selectedFiles.length > 0 && (
        <div className="flex flex-col space-y-3">
          {/* Botão principal de processar - melhorado */}
          <Button
            onClick={onProcessImages}
            className="
              w-full
              h-14 sm:h-16
              bg-emerald-600
              hover:opacity-90
              text-white font-fredoka font-bold
              text-lg sm:text-xl
              rounded-xl
              shadow-lg
              border-2 border-white/20
              transform hover:scale-105 transition-all duration-300
              relative overflow-hidden
            "
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-base sm:text-lg">
                  📚 Criando Resumo... {selectedFiles.length} foto{selectedFiles.length > 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <span className="text-xl">📚</span>
                <span>Criar Resumo!</span>
                <span className="text-xl">✨</span>
              </div>
            )}
            
            {/* Efeito shimmer quando não está processando */}
            {!isProcessing && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
            )}
          </Button>

          {/* Botão secundário - melhorado */}
          <Button
            variant="outline"
            onClick={onChooseOther}
            disabled={isProcessing}
            className="
              h-12
              font-nunito font-semibold
              text-base
              rounded-lg
              border-2 border-primary/20
              text-primary
              hover:bg-primary/5
              shadow-md
              transform hover:scale-105 transition-all duration-200
            "
          >
            <span className="text-lg mr-2">🔄</span>
            Escolher Outras Fotos
          </Button>
        </div>
      )}

      {/* Seção para adicionar mais fotos */}
      {selectedFiles.length > 0 && !isProcessing && (
        <div className="border-t-2 border-dashed border-primary/15 pt-4 mt-4 bg-muted/50 rounded-lg p-4">
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
            className="
              w-full
              h-12
              font-nunito font-semibold
              text-base
              rounded-lg
              border-2 border-orange-300
              text-orange-700
              hover:bg-orange-50
              shadow-md
              transform hover:scale-105 transition-all duration-200
              bg-background/80
            "
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-lg mr-2">📸</span>
            Adicionar Mais Fotos (Total: {selectedFiles.length})
            <span className="text-lg ml-2">✨</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadActions;
