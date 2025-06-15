
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { designColors } from '@/utils/designSystem';

const HomeHeader = () => {
  return (
    <header className={`${designColors.backgrounds.header} sticky top-0 z-50 shadow-xl`}>
      <div className={`container mx-auto ${designColors.responsive.containerPadding} py-3 sm:py-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-lg sm:text-xl md:text-2xl">🎓</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-fredoka text-gray-700 drop-shadow-lg">EstudoFácil AI</h1>
              <p className="text-xs sm:text-sm md:text-lg font-nunito text-gray-600 font-semibold hidden sm:block">✨ Aprender nunca foi tão divertido! ✨</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 relative z-50">
            <Link to="/login" className="relative z-50">
              <Button 
                variant="outline" 
                className="bg-white/90 border-2 border-cyan-300 text-gray-700 font-nunito font-bold hover:bg-cyan-50 shadow-lg text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 relative z-50"
                style={{ pointerEvents: 'auto' }}
              >
                <span className="hidden sm:inline">🔑 </span>Entrar
              </Button>
            </Link>
            <Link to="/new-signup" className="relative z-50">
              <Button 
                className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-fredoka shadow-lg border-2 border-white/50 text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2 relative z-50"
                style={{ pointerEvents: 'auto' }}
              >
                <span className="hidden sm:inline">🌟 </span>Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
