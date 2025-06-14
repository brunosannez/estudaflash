
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, ArrowLeft, Brain, Loader2, Wand2, BookOpen, Clock, Target, Home, TestTube } from 'lucide-react';
import { useSummary } from '@/hooks/useSummary';
import { useAutoFlashcards } from '@/hooks/useAutoFlashcards';
import { useQuiz } from '@/hooks/useQuiz';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import FlashcardList from '@/components/FlashcardList';
import QuizGeneratorButton from "@/components/QuizGeneratorButton";
import ResumoContent from '@/components/ResumoContent';

const Resumo = () => {
  const { uploadId } = useParams();
  const navigate = useNavigate();
  const { getResumo } = useSummary();
  const { generateAutoFlashcards, isGenerating } = useAutoFlashcards();
  const [resumo, setResumo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  
  // Hook do quiz
  const { generateQuiz, loading: quizLoading } = useQuiz(resumo?.id || '');

  useEffect(() => {
    if (uploadId) {
      loadResumo();
    }
    // eslint-disable-next-line
  }, [uploadId]);

  const loadResumo = async () => {
    try {
      setLoading(true);
      const resumoData = await getResumo(uploadId!);
      if (resumoData) {
        setResumo(resumoData);
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGerarFlashcards = () => {
    setShowFlashcards(true);
  };

  const handleGerarFlashcardsAutomatico = async () => {
    try {
      await generateAutoFlashcards(resumo.id, resumo.resumo_gerado);
      // Opcional: atualizar a lista de flashcards se estiver aberta
    } catch (error) {
      console.error('Erro ao gerar flashcards automáticos:', error);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      const success = await generateQuiz(resumo.resumo_gerado);
      if (success) {
        // Navegar para a página de quiz
        navigate(`/quiz/${resumo.id}`);
      }
    } catch (error) {
      console.error('Erro ao gerar quiz:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </main>
      </div>
    );
  }

  const dataFormatada = new Date(resumo.data_criacao).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const estimatedReadTime = Math.ceil(resumo.resumo_gerado.length / 1000); // ~1000 chars per minute

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Header Section */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:bg-blue-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                Resumo Didático
              </h1>
              <p className="text-gray-600 mt-1">Seu material de estudo personalizado</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-8 w-8" />
                <div>
                  <p className="text-blue-100 text-sm">Tempo de Leitura</p>
                  <p className="text-xl font-bold">{estimatedReadTime} min</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="h-8 w-8" />
                <div>
                  <p className="text-green-100 text-sm">Caracteres</p>
                  <p className="text-xl font-bold">{resumo.resumo_gerado.length.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <Target className="h-8 w-8" />
                <div>
                  <p className="text-purple-100 text-sm">Criado em</p>
                  <p className="text-lg font-bold">{dataFormatada.split(' ')[0]}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card className="overflow-hidden shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Conteúdo do Resumo
              </CardTitle>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Gerado em {dataFormatada}
              </p>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="p-8">
                <ResumoContent content={resumo.resumo_gerado} />
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50 p-6 border-t">
                <div className="flex flex-col lg:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleGerarFlashcardsAutomatico}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Gerando Flashcards...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-5 w-5 mr-2" />
                        Gerar Flashcards IA
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleGerarFlashcards}
                    variant="outline"
                    className="border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-purple-700"
                    size="lg"
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    Gerenciar Flashcards
                  </Button>
                  
                  <Button
                    onClick={handleGenerateQuiz}
                    disabled={quizLoading}
                    className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
                    size="lg"
                  >
                    {quizLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Gerando Quiz...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-5 w-5 mr-2" />
                        Gerar Quiz IA
                      </>
                    )}
                  </Button>
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 pt-4 border-t">
                  <Button 
                    onClick={() => navigate('/')}
                    variant="outline"
                    size="sm"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Início
                  </Button>
                  <Button 
                    onClick={() => navigate('/meus-flashcards')}
                    variant="outline"
                    size="sm"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Meus Flashcards
                  </Button>
                  <Button 
                    onClick={() => navigate('/meus-resumos')}
                    variant="outline"
                    size="sm"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Meus Resumos
                  </Button>
                  <Button 
                    onClick={() => navigate('/progresso')}
                    variant="outline"
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Progresso
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <FlashcardList resumoId={resumo.id} open={showFlashcards} onClose={() => setShowFlashcards(false)} />
      </div>
    </AuthGuard>
  );
};

export default Resumo;
