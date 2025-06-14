
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Brain, Target, Trophy, Zap, FileText, Star, Heart, Sparkles } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { designColors } from '@/utils/designSystem';

const Home = () => {
  return (
    <div className={`min-h-screen ${designColors.backgrounds.main} relative overflow-hidden`}>
      {/* Floating Elements - Responsivos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-10 left-5 sm:top-20 sm:left-10 ${designColors.responsive.floatingElements} animate-bounce-gentle`}>🌟</div>
        <div className={`absolute top-20 right-10 sm:top-32 sm:right-20 ${designColors.responsive.floatingElements} animate-wiggle`}>🎨</div>
        <div className={`absolute top-32 left-1/4 sm:top-64 ${designColors.responsive.floatingElements} animate-bounce-gentle delay-500`}>🚀</div>
        <div className={`absolute bottom-20 right-1/4 sm:bottom-32 ${designColors.responsive.floatingElements} animate-wiggle delay-1000`}>🎯</div>
        <div className={`absolute top-48 right-5 sm:top-96 sm:right-10 ${designColors.responsive.floatingElements} animate-bounce-gentle delay-300`}>⭐</div>
      </div>

      {/* Header - Responsivo */}
      <header className={`${designColors.backgrounds.header} sticky top-0 z-50 shadow-xl`}>
        <div className={`container mx-auto ${designColors.responsive.containerPadding} py-3 sm:py-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-gentle">
                <span className="text-lg sm:text-xl md:text-2xl">🎓</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-fredoka text-gray-700 drop-shadow-lg">EstudoFácil AI</h1>
                <p className="text-xs sm:text-sm md:text-lg font-nunito text-gray-600 font-semibold hidden sm:block">✨ Aprender nunca foi tão divertido! ✨</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <AuthModal>
                <Button variant="outline" className="bg-white/90 border-2 border-cyan-300 text-gray-700 font-nunito font-bold hover:bg-cyan-50 shadow-lg text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2">
                  <span className="hidden sm:inline">🔑 </span>Entrar
                </Button>
              </AuthModal>
              <AuthModal>
                <Button className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-fredoka shadow-lg border-2 border-white/50 text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2">
                  <span className="hidden sm:inline">🌟 </span>Criar Conta
                </Button>
              </AuthModal>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Responsivo */}
      <section className={`py-8 sm:py-12 md:py-20 ${designColors.responsive.containerPadding}`}>
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto">
            <div className="mb-4 sm:mb-8">
              <span className="text-4xl sm:text-6xl md:text-8xl animate-bounce-gentle inline-block">🎨</span>
              <span className="text-4xl sm:text-6xl md:text-8xl animate-wiggle inline-block mx-2 sm:mx-4">📚</span>
              <span className="text-4xl sm:text-6xl md:text-8xl animate-bounce-gentle inline-block">🧠</span>
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
            
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 justify-center">
              <AuthModal>
                <Button size="lg" className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white text-sm sm:text-lg md:text-2xl font-fredoka px-6 py-3 sm:px-12 sm:py-6 rounded-full shadow-2xl border-4 border-white/50 transform hover:scale-105 transition-all">
                  🚀 Começar a Diversão - GRÁTIS!
                </Button>
              </AuthModal>
              <AuthModal>
                <Button size="lg" variant="outline" className="text-sm sm:text-lg md:text-2xl font-fredoka px-6 py-3 sm:px-12 sm:py-6 rounded-full bg-white/90 border-4 border-cyan-300 text-gray-700 hover:bg-cyan-50 shadow-xl transform hover:scale-105 transition-all">
                  🎯 Já tenho conta!
                </Button>
              </AuthModal>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Responsivo */}
      <section className={`py-8 sm:py-16 ${designColors.responsive.containerPadding} bg-white/80 backdrop-blur-sm`}>
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h3 className={`${designColors.responsive.pageTitle} font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-purple-600 mb-4`}>
              🎪 Como funciona a mágica?
            </h3>
            <p className={`${designColors.responsive.heroText} font-nunito text-gray-600 font-semibold`}>✨ Em 4 passos super fáceis! ✨</p>
          </div>
          
          <div className={`grid ${designColors.responsive.gridCols4} gap-4 sm:gap-8`}>
            <Card className="text-center p-4 sm:p-8 hover:shadow-2xl transition-all transform hover:scale-105 bg-gradient-to-br from-cyan-100 to-cyan-200 border-4 border-cyan-300 rounded-2xl sm:rounded-3xl">
              <CardContent className="space-y-3 sm:space-y-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-lg sm:text-2xl md:text-3xl">📷</span>
                </div>
                <h4 className={`${designColors.responsive.cardTitle} font-fredoka text-gray-700`}>1. Tire uma Foto!</h4>
                <p className={`text-gray-600 font-nunito font-semibold ${designColors.responsive.bodyText}`}>
                  📸 Fotografe seus livros, cadernos ou qualquer material de estudo!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-8 hover:shadow-2xl transition-all transform hover:scale-105 bg-gradient-to-br from-purple-100 to-purple-200 border-4 border-purple-300 rounded-2xl sm:rounded-3xl">
              <CardContent className="space-y-3 sm:space-y-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-lg sm:text-2xl md:text-3xl">🤖</span>
                </div>
                <h4 className={`${designColors.responsive.cardTitle} font-fredoka text-gray-700`}>2. IA Mágica!</h4>
                <p className={`text-gray-600 font-nunito font-semibold ${designColors.responsive.bodyText}`}>
                  ✨ Nossa IA super inteligente lê tudo e cria resumos incríveis!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-8 hover:shadow-2xl transition-all transform hover:scale-105 bg-gradient-to-br from-green-100 to-green-200 border-4 border-green-300 rounded-2xl sm:rounded-3xl">
              <CardContent className="space-y-3 sm:space-y-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-lg sm:text-2xl md:text-3xl">🎮</span>
                </div>
                <h4 className={`${designColors.responsive.cardTitle} font-fredoka text-gray-700`}>3. Jogos Divertidos!</h4>
                <p className={`text-gray-600 font-nunito font-semibold ${designColors.responsive.bodyText}`}>
                  🎯 Flashcards coloridos e quizzes super legais para testar seus conhecimentos!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-4 sm:p-8 hover:shadow-2xl transition-all transform hover:scale-105 bg-gradient-to-br from-yellow-100 to-orange-200 border-4 border-yellow-300 rounded-2xl sm:rounded-3xl">
              <CardContent className="space-y-3 sm:space-y-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-lg sm:text-2xl md:text-3xl">🏆</span>
                </div>
                <h4 className={`${designColors.responsive.cardTitle} font-fredoka text-gray-700`}>4. Ganhe Pontos!</h4>
                <p className={`text-gray-600 font-nunito font-semibold ${designColors.responsive.bodyText}`}>
                  🌟 Suba de nível, ganhe medalhas e vire um expert!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section - Responsivo */}
      <section className={`py-8 sm:py-16 ${designColors.responsive.containerPadding} bg-gradient-to-r from-cyan-100 via-green-100 to-purple-100`}>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-8">
              <h3 className={`${designColors.responsive.pageTitle} font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-purple-600 mb-4 sm:mb-8`}>
                🎯 Por que é tão legal?
              </h3>
              
              <div className="space-y-4 sm:space-y-8">
                <div className="flex items-start space-x-3 sm:space-x-6 bg-white/90 p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-cyan-200">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm sm:text-2xl">🚀</span>
                  </div>
                  <div>
                    <h4 className={`font-fredoka ${designColors.responsive.cardTitle} text-gray-700 mb-2`}>Super Tecnologia!</h4>
                    <p className={`text-gray-600 font-nunito font-semibold ${designColors.responsive.bodyText}`}>
                      🔬 Usamos a mesma tecnologia do Google para ler suas fotos perfeitamente!
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 sm:space-x-6 bg-white/90 p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-green-200">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm sm:text-2xl">🧠</span>
                  </div>
                  <div>
                    <h4 className={`font-fredoka ${designColors.responsive.cardTitle} text-gray-700 mb-2`}>Aprenda Brincando!</h4>
                    <p className={`text-gray-600 font-nunito font-semibold ${designColors.responsive.bodyText}`}>
                      🎮 Jogos, cores e diversão para nunca mais esquecer o que aprendeu!
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 sm:space-x-6 bg-white/90 p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-purple-200">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm sm:text-2xl">🏆</span>
                  </div>
                  <div>
                    <h4 className={`font-fredoka ${designColors.responsive.cardTitle} text-gray-700 mb-2`}>Sistema de Recompensas!</h4>
                    <p className={`text-gray-600 font-nunito font-semibold ${designColors.responsive.bodyText}`}>
                      ⭐ Ganhe pontos, suba de nível e desbloqueie conquistas incríveis!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-400 to-cyan-500 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white shadow-2xl transform rotate-1 hover:rotate-0 transition-all">
                <div className="text-center">
                  <span className="text-3xl sm:text-6xl block mb-2 sm:mb-4">🎉</span>
                  <h4 className={`${designColors.responsive.sectionTitle} font-fredoka mb-3 sm:mb-6`}>Começe hoje mesmo!</h4>
                  <p className={`mb-4 sm:mb-8 ${designColors.responsive.heroText} font-nunito font-semibold`}>
                    🌟 Transforme seus estudos em uma aventura incrível!
                  </p>
                  <AuthModal>
                    <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-fredoka text-sm sm:text-xl px-4 py-2 sm:px-8 sm:py-4 rounded-full w-full shadow-lg">
                      🚀 Quero Começar Agora!
                    </Button>
                  </AuthModal>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Responsivo */}
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
    </div>
  );
};

export default Home;
