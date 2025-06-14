
import { Card, CardContent } from '@/components/ui/card';
import { designColors } from '@/utils/designSystem';

const FeaturesSection = () => {
  const features = [
    {
      icon: '📷',
      title: '1. Tire uma Foto!',
      description: '📸 Fotografe seus livros, cadernos ou qualquer material de estudo!',
      gradient: 'from-cyan-100 to-cyan-200',
      border: 'border-cyan-300',
      iconGradient: 'from-cyan-400 to-cyan-500'
    },
    {
      icon: '🤖',
      title: '2. IA Mágica!',
      description: '✨ Nossa IA super inteligente lê tudo e cria resumos incríveis!',
      gradient: 'from-purple-100 to-purple-200',
      border: 'border-purple-300',
      iconGradient: 'from-purple-400 to-purple-500'
    },
    {
      icon: '🎮',
      title: '3. Jogos Divertidos!',
      description: '🎯 Flashcards coloridos e quizzes super legais para testar seus conhecimentos!',
      gradient: 'from-green-100 to-green-200',
      border: 'border-green-300',
      iconGradient: 'from-green-400 to-green-500'
    },
    {
      icon: '🏆',
      title: '4. Ganhe Pontos!',
      description: '🌟 Suba de nível, ganhe medalhas e vire um expert!',
      gradient: 'from-yellow-100 to-orange-200',
      border: 'border-yellow-300',
      iconGradient: 'from-yellow-400 to-orange-500'
    }
  ];

  return (
    <section className={`py-8 sm:py-16 ${designColors.responsive.containerPadding} bg-white/80 backdrop-blur-sm`}>
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-16">
          <h3 className={`${designColors.responsive.pageTitle} font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-purple-600 mb-4`}>
            🎪 Como funciona a mágica?
          </h3>
          <p className={`${designColors.responsive.heroText} font-nunito text-gray-600 font-semibold`}>✨ Em 4 passos super fáceis! ✨</p>
        </div>
        
        <div className={`grid ${designColors.responsive.gridCols4} gap-4 sm:gap-8`}>
          {features.map((feature, index) => (
            <Card key={index} className={`text-center p-4 sm:p-8 hover:shadow-2xl transition-all transform hover:scale-105 bg-gradient-to-br ${feature.gradient} border-4 ${feature.border} rounded-2xl sm:rounded-3xl`}>
              <CardContent className="space-y-3 sm:space-y-6">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r ${feature.iconGradient} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                  <span className="text-lg sm:text-2xl md:text-3xl">{feature.icon}</span>
                </div>
                <h4 className={`${designColors.responsive.cardTitle} font-fredoka text-gray-700`}>{feature.title}</h4>
                <p className={`text-gray-600 font-nunito font-semibold ${designColors.responsive.bodyText}`}>
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
