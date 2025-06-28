
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { designColors } from '@/utils/designSystem';
import { Zap, Sparkles } from 'lucide-react';

const HomeHeader = () => {
  return (
    <header className={`${designColors.backgrounds.header} sticky top-0 z-50 shadow-xl`}>
      <div className={`container mx-auto ${designColors.responsive.containerPadding} py-3 sm:py-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative group">
              <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
                <Zap className="text-lg sm:text-xl md:text-2xl text-white relative z-10 animate-bounce" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
              <Sparkles className="absolute -bottom-1 -left-1 w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
            </div>
            <div className="relative">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
                Estuda Flash
              </h1>
              <p className="text-xs sm:text-sm md:text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent hidden sm:block">
                ⚡ Aprender nunca foi tão rápido! ⚡
              </p>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-60 animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 relative z-50">
            <Link to="/login" className="relative z-50">
              <Button 
                variant="outline" 
                className="bg-white/90 border-2 border-cyan-300 text-gray-700 font-bold hover:bg-gradient-to-r hover:from-cyan-50 hover:to-purple-50 shadow-lg text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 relative z-50"
                style={{ pointerEvents: 'auto' }}
              >
                <span className="hidden sm:inline">🔑 </span>Entrar
              </Button>
            </Link>
            <Link to="/new-signup" className="relative z-50">
              <Button 
                className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 hover:from-cyan-500 hover:via-purple-600 hover:to-pink-600 text-white font-bold shadow-lg border-2 border-white/50 text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 relative z-50"
                style={{ pointerEvents: 'auto' }}
              >
                <span className="hidden sm:inline">⚡ </span>Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
