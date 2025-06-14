
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Brain, Target, Trophy, Zap, FileText } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">EstudoFácil AI</h1>
                <p className="text-sm text-gray-600">Transforme suas imagens em conhecimento</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <AuthModal>
                <Button variant="outline">
                  Entrar
                </Button>
              </AuthModal>
              <AuthModal>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Criar Conta
                </Button>
              </AuthModal>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-800 mb-6">
              Transforme qualquer imagem de estudo em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                conteúdo útil com IA
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Faça upload de suas anotações, livros ou materiais de estudo em formato de imagem. 
              Nossa IA extrai o texto, cria resumos inteligentes, gera flashcards e quizzes personalizados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AuthModal>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3">
                  Começar Agora - Grátis
                </Button>
              </AuthModal>
              <AuthModal>
                <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                  Fazer Login
                </Button>
              </AuthModal>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Como funciona o EstudoFácil AI
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold">OCR + Resumo</h4>
                <p className="text-gray-600">
                  Extraia texto de qualquer imagem e gere resumos inteligentes com IA
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold">Flashcards</h4>
                <p className="text-gray-600">
                  Crie flashcards automaticamente para revisão com repetição espaçada
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-xl font-semibold">Quizzes</h4>
                <p className="text-gray-600">
                  Teste seus conhecimentos com quizzes gerados automaticamente
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
                <h4 className="text-xl font-semibold">Progresso Gamificado</h4>
                <p className="text-gray-600">
                  Ganhe XP, suba de nível e acompanhe seu progresso de estudos
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                Estude de forma mais inteligente, não mais difícil
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">OCR Avançado</h4>
                    <p className="text-gray-600">
                      Tecnologia Google Vision para extrair texto com alta precisão de qualquer imagem
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Brain className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">IA Inteligente</h4>
                    <p className="text-gray-600">
                      Resumos, flashcards e quizzes gerados automaticamente com inteligência artificial
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Trophy className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Gamificação</h4>
                    <p className="text-gray-600">
                      Sistema de XP, níveis e conquistas para manter você motivado nos estudos
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h4 className="text-2xl font-bold mb-4">Comece hoje mesmo!</h4>
                <p className="mb-6">
                  Transforme suas imagens de estudo em conteúdo interativo e acompanhe seu progresso
                </p>
                <AuthModal>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full">
                    Criar Conta Grátis
                  </Button>
                </AuthModal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold">EstudoFácil AI</span>
            </div>
            <div className="text-sm text-gray-400 text-center md:text-right">
              <p>&copy; 2024 EstudoFácil AI. Todos os direitos reservados.</p>
              <p className="mt-1">Transformando educação com inteligência artificial</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
