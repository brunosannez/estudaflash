
import { designColors } from '@/utils/designSystem';

const HomeFooter = () => {
  return (
    <footer className={`bg-gradient-to-r from-gray-700 to-purple-600 text-white py-6 sm:py-12 ${designColors.responsive.containerPadding}`}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-4 mb-4 sm:mb-6 md:mb-0">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-400 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-lg sm:text-2xl">🎓</span>
            </div>
            <span className="text-lg sm:text-2xl font-fredoka">EstudoFácil AI</span>
          </div>
          <div className="text-center md:text-right font-nunito">
            <p className={`${designColors.responsive.bodyText} font-semibold`}>&copy; 2024 EstudoFácil AI. Feito com 💖</p>
            <p className={`mt-2 text-cyan-200 ${designColors.responsive.captionText}`}>✨ Transformando educação com diversão e tecnologia! ✨</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
