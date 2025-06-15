
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { designColors } from '@/utils/designSystem';

const HeroSection = () => {
  return (
    <section className={`py-8 sm:py-12 md:py-20 ${designColors.responsive.containerPadding} relative z-10`}>
      <div className="container mx-auto text-center">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 sm:mb-8">
            <span className="text-4xl sm:text-6xl md:text-8xl animate-bounce-gentle inline-block pointer-events-none" style={{ animationDelay: '0s' }}>🎨</span>
            <span className="text-4xl sm:text-6xl md:text-8xl animate-wiggle inline-block mx-2 sm:mx-4 pointer-events-none" style={{ animationDelay: '0.3s' }}>📚</span>
            <span className="text-4xl sm:text-6xl md:text-8xl animate-bounce-gentle inline-block pointer-events-none" style={{ animationDelay: '0.6s' }}>🧠</span>
          </div>
          
          <h2 className={`${designColors.responsive.heroTitle} font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-gray-700 via-purple-600 to-cyan-600 mb-4 sm:mb-8 leading-tight`}>
            Transforme fotos em
            <br />
            <span className="text-green-500">diversão educativa!</span>
          </h2>
          
          <p className={`${designColors.responsive.heroText} text-gray-700 mb-6 sm:mb-10 leading-relaxed font-nunito font-semibold bg-white/70 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-cyan-200`}>
            🌈 Tire foto dos seus livros e cadernos! Nossa IA mágica cria jogos, 
            quizzes coloridos e cartões super divertidos para você aprender brincando! 🎮✨
          </p>
          
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 justify-center relative z-50">
            <Link to="/signup" className="relative z-50">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white text-sm sm:text-lg md:text-2xl font-fredoka px-6 py-3 sm:px-12 sm:py-6 rounded-full shadow-2xl border-4 border-white/50 transform hover:scale-105 transition-all relative z-50"
                style={{ pointerEvents: 'auto' }}
              >
                🚀 Começar a Diversão - GRÁTIS!
              </Button>
            </Link>
            <Link to="/login" className="relative z-50">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-sm sm:text-lg md:text-2xl font-fredoka px-6 py-3 sm:px-12 sm:py-6 rounded-full bg-white/90 border-4 border-cyan-300 text-gray-700 hover:bg-cyan-50 shadow-xl transform hover:scale-105 transition-all relative z-50"
                style={{ pointerEvents: 'auto' }}
              >
                🎯 Já tenho conta!
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
