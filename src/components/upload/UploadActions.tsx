
import { Loader2, Sparkles, Upload, Plus } from 'lucide-react';
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
    <div className="space-y-4 sm:space-y-6">
      {selectedFiles.length > 0 && (
        <div className="flex flex-col space-y-3 sm:space-y-4">
          {/* Botão principal de processar - GIGANTE */}
          <Button
            onClick={onProcessImages}
            className="
              w-full
              h-16 sm:h-20 md:h-24
              bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500
              hover:from-green-600 hover:via-emerald-600 hover:to-teal-600
              text-white font-fredoka font-bold
              text-lg sm:text-xl md:text-2xl
              rounded-2xl sm:rounded-3xl
              shadow-2xl
              border-4 border-white/30
              transform hover:scale-105 transition-all duration-300
              relative overflow-hidden
            "
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2 sm:space-x-4">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
                <span className="text-base sm:text-lg md:text-xl">
                  🔮 Criando Magia... {selectedFiles.length} foto{selectedFiles.length > 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 sm:space-x-4 relative z-10">
                <span className="text-2xl sm:text-3xl md:text-4xl">✨</span>
                <span>Criar Jogos Divertidos!</span>
                <span className="text-2xl sm:text-3xl md:text-4xl">🎮</span>
              </div>
            )}
            
            {/* Efeito shimmer quando não está processando */}
            {!isProcessing && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"></div>
            )}
          </Button>

          {/* Botão secundário - menor mas ainda visível */}
          <Button
            variant="outline"
            onClick={onChooseOther}
            disabled={isProcessing}
            className="
              h-12 sm:h-14 md:h-16
              font-nunito font-bold
              text-base sm:text-lg
              rounded-xl sm:rounded-2xl
              border-3 border-purple-300
              text-purple-700
              hover:bg-purple-50
              shadow-lg
              transform hover:scale-105 transition-all duration-200
            "
          >
            <span className="text-xl sm:text-2xl mr-2">🔄</span>
            Escolher Outras Fotos
          </Button>
        </div>
      )}

      {/* Seção para adicionar mais fotos */}
      {selectedFiles.length < MAX_IMAGES && selectedFiles.length > 0 && !isProcessing && (
        <div className="border-t-4 border-dashed border-cyan-300 pt-4 sm:pt-6 mt-4 sm:mt-6 bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl p-4 sm:p-6">
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
              h-12 sm:h-14 md:h-16
              font-nunito font-bold
              text-base sm:text-lg
              rounded-xl sm:rounded-2xl
              border-3 border-orange-300
              text-orange-700
              hover:bg-orange-50
              shadow-lg
              transform hover:scale-105 transition-all duration-200
              bg-white/80
            "
          >
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            <span className="text-xl sm:text-2xl mr-2">📸</span>
            Adicionar Mais Fotos ({selectedFiles.length}/{MAX_IMAGES})
            <span className="text-xl sm:text-2xl ml-2">✨</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadActions;
