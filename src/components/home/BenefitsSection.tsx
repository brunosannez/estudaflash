
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';
import { designColors } from '@/utils/designSystem';

const BenefitsSection = () => {
  const benefits = [
    {
      icon: '🚀',
      title: 'Super Tecnologia!',
      description: '🔬 Usamos a mesma tecnologia do Google para ler suas fotos perfeitamente!',
      gradient: 'from-cyan-400 to-purple-500',
      border: 'border-cyan-200'
    },
    {
      icon: '🧠',
      title: 'Aprenda Brincando!',
      description: '🎮 Jogos, cores e diversão para nunca mais esquecer o que aprendeu!',
      gradient: 'from-green-400 to-cyan-500',
      border: 'border-green-200'
    },
    {
      icon: '🏆',
      title: 'Sistema de Recompensas!',
      description: '⭐ Ganhe pontos, suba de nível e desbloqueie conquistas incríveis!',
      gradient: 'from-purple-400 to-cyan-500',
      border: 'border-purple-200'
    }
  ];

  return (
    <section className={`py-8 sm:py-16 ${designColors.responsive.containerPadding} bg-gradient-to-r from-cyan-100 via-green-100 to-purple-100`}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
          <div className="space-y-4 sm:space-y-8">
            <h3 className={`${designColors.responsive.pageTitle} font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-purple-600 mb-4 sm:mb-8`}>
              🎯 Por que é tão legal?
            </h3>
            
            <div className="space-y-4 sm:space-y-8">
              {benefits.map((benefit, index) => (
                <div key={index} className={`flex items-start space-x-3 sm:space-x-6 bg-white/90 p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border ${benefit.border}`}>
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r ${benefit.gradient} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-sm sm:text-2xl">{benefit.icon}</span>
                  </div>
                  <div>
                    <h4 className={`font-fredoka ${designColors.responsive.cardTitle} text-gray-700 mb-2`}>{benefit.title}</h4>
                    <p className={`text-gray-600 font-nunito font-semibold ${designColors.responsive.bodyText}`}>
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
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
  );
};

export default BenefitsSection;
