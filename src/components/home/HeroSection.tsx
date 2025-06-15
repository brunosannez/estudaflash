
import { ArrowRight, BookOpen, Brain, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 opacity-80" />
      <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-200 rounded-full opacity-20 animate-pulse delay-500" />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Floating icons */}
          <div className="flex justify-center space-x-8 mb-8">
            <div className="bg-white p-3 rounded-full shadow-lg animate-bounce">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            <div className="bg-white p-3 rounded-full shadow-lg animate-bounce delay-100">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <div className="bg-white p-3 rounded-full shadow-lg animate-bounce delay-200">
              <Trophy className="w-8 h-8 text-pink-600" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Transforme seus estudos com{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Inteligência Artificial
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Crie resumos inteligentes, flashcards personalizados e quizzes adaptativos 
            em segundos. Estude de forma mais eficiente e divertida! 🚀
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/new-signup">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Link to="/login">
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-4 text-lg font-semibold rounded-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 transition-all duration-300"
              >
                Já tenho conta
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 text-sm text-gray-500 flex items-center justify-center space-x-4">
            <span className="flex items-center">
              ✅ Grátis para começar
            </span>
            <span className="flex items-center">
              ✅ Sem cartão de crédito
            </span>
            <span className="flex items-center">
              ✅ Resultados em segundos
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
