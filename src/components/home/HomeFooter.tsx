
import { designColors } from '@/utils/designSystem';
import { Zap } from 'lucide-react';

const HomeFooter = () => {
  return (
    <footer className={`bg-gradient-to-r from-gray-700 via-purple-600 to-cyan-600 text-white py-6 sm:py-12 ${designColors.responsive.containerPadding}`}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-4 mb-4 sm:mb-6 md:mb-0">
            <div className="relative">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 animate-pulse rounded-full"></div>
                <Zap className="text-lg sm:text-2xl text-white relative z-10" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-cyan-200 to-purple-200 bg-clip-text text-transparent">
              Estuda Flash
            </span>
          </div>
          <div className="text-center md:text-right font-nunito">
            <p className={`${designColors.responsive.bodyText} font-semibold`}>
              &copy; 2024 Estuda Flash. Feito com 💖
            </p>
            <p className={`mt-2 text-cyan-200 ${designColors.responsive.captionText}`}>
              ⚡ Transformando educação com velocidade e tecnologia! ⚡
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
