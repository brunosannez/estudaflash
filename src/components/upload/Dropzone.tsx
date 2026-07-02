
import { Upload, Image, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MAX_IMAGES = 5;

interface DropzoneProps {
  onFileButtonClick: () => void;
  isProcessing: boolean;
}

const Dropzone = ({ onFileButtonClick, isProcessing }: DropzoneProps) => {
  return (
    <div className="text-center space-y-4 sm:space-y-6">
      {/* Ícones grandes e animados */}
      <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-4 sm:mb-6">
        <Camera className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-purple-400 animate-bounce" />
        <span className="text-4xl sm:text-5xl md:text-6xl animate-wiggle">📸</span>
        <Upload className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-cyan-400 animate-bounce" />
      </div>

      {/* Título principal */}
      <h3 className="text-xl sm:text-2xl md:text-3xl font-fredoka font-bold text-foreground mb-2 sm:mb-4">
        📚 Vamos Estudar Juntos! ✨
      </h3>

      {/* Texto simplificado */}
      <p className="text-base sm:text-lg md:text-xl text-foreground/80 font-nunito font-semibold mb-4 sm:mb-6 leading-relaxed">
        🎨 Tire uma foto dos seus livros e cadernos!<br className="sm:hidden" />
        <span className="hidden sm:inline"> </span>📖 Vou criar jogos divertidos para você! 🎮
      </p>

      {/* Botão principal GIGANTE */}
      <Button
        onClick={onFileButtonClick}
        className="
          w-full max-w-sm mx-auto
          h-16 sm:h-20 md:h-24
          bg-primary 
          hover:opacity-90
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
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 relative z-10">
          <span className="text-2xl sm:text-3xl md:text-4xl">📷</span>
          <span>Escolher Fotos</span>
          <span className="text-2xl sm:text-3xl md:text-4xl">✨</span>
        </div>
        
        {/* Efeito brilho diagonal */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 w-24 h-full animate-diagonal-shine"></div>
      </Button>

      {/* Informação sobre limite */}
      <div className="flex items-center justify-center space-x-2 text-sm sm:text-base text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border-2 border-primary/20">
        <span className="text-lg sm:text-xl">🔢</span>
        <span className="font-semibold">Até {MAX_IMAGES} fotos por vez</span>
        <span className="text-lg sm:text-xl">📸</span>
      </div>
    </div>
  );
};

export default Dropzone;
