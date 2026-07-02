
import { Button } from '@/components/ui/button';
import { designColors } from '@/utils/designSystem';

interface BackButtonProps {
  onClick: () => void;
}

const BackButton = ({ onClick }: BackButtonProps) => {
  return (
    <div className="fixed top-16 sm:top-20 left-2 sm:left-4 z-50">
      <Button 
        variant="outline" 
        onClick={onClick}
        className={`bg-background/90 backdrop-blur-sm border-2 border-cyan-300 text-foreground/80 font-bold py-1 px-2 sm:py-2 sm:px-4 rounded-lg sm:rounded-xl shadow-lg ${designColors.animations.buttonHover} text-xs sm:text-sm`}
      >
        ← 🏠 <span className="hidden sm:inline">Voltar ao Menu</span>
      </Button>
    </div>
  );
};

export default BackButton;
