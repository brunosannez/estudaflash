
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { designColors } from '@/utils/designSystem';

interface FlashcardsTabContentProps {
  onSelectExisting: () => void;
  onUploadNew: () => void;
}

const FlashcardsTabContent = ({ onSelectExisting, onUploadNew }: FlashcardsTabContentProps) => {
  return (
    <div className={`${designColors.cards.secondary} text-center py-8 sm:py-16 px-4 sm:px-8`}>
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Brain className={`h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-purple-500 ${designColors.animations.iconFloat}`} />
        <div className="text-3xl sm:text-6xl animate-pulse">🧠</div>
      </div>
      <h3 className={`${designColors.responsive.sectionTitle} font-bold bg-gradient-to-r from-gray-700 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-4`}>
        Estudar com Flashcards Mágicos! ✨
      </h3>
      <p className={`${designColors.responsive.heroText} text-gray-600 mb-4 sm:mb-8 max-w-2xl mx-auto`}>
        🎪 Escolha um resumo existente ou faça upload de uma nova imagem para começar sua aventura de aprendizado!
      </p>
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-6 justify-center">
        <Button 
          onClick={onSelectExisting}
          className={`${designColors.buttons.primary} text-white font-bold ${designColors.responsive.buttonPadding} rounded-xl shadow-lg ${designColors.responsive.heroText} ${designColors.animations.buttonHover}`}
        >
          🎯 Usar Resumo Existente
        </Button>
        <Button 
          variant="outline"
          onClick={onUploadNew}
          className={`border-2 border-purple-300 text-gray-700 font-bold ${designColors.responsive.buttonPadding} rounded-xl shadow-lg ${designColors.responsive.heroText} hover:bg-purple-50 ${designColors.animations.buttonHover}`}
        >
          📤 Fazer Novo Upload
        </Button>
      </div>
    </div>
  );
};

export default FlashcardsTabContent;
