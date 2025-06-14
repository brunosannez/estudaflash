import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, ArrowLeft, Brain, Loader2 } from 'lucide-react';
import { useSummary } from '@/hooks/useSummary';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import FlashcardList from '@/components/FlashcardList';
import QuizGeneratorButton from "@/components/QuizGeneratorButton";

const Resumo = () => {
  const { uploadId } = useParams();
  const navigate = useNavigate();
  const { getResumo } = useSummary();
  const [resumo, setResumo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <h1 className="text-3xl font-bold text-gray-800">Resumo Gerado</h1>
            </div>

            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileText className="h-6 w-6 text-green-600" />
                  Resumo Didático
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Gerado em {new Date(resumo.data_criacao).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="bg-gray-50 rounded-lg p-6 border">
                    <pre className="whitespace-pre-wrap text-gray-800 font-medium leading-relaxed">
                      {resumo.resumo_gerado}
                    </pre>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 justify-center mt-8 pt-6 border-t">
                  <Button 
                    onClick={handleGerarFlashcards}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    size="lg"
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    Gerenciar Flashcards
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setShowQuiz(true)}
                  >
                    <Sparkles className="h-5 w-5" />
                    Gerar/Responder Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <FlashcardList resumoId={resumo.id} open={showFlashcards} onClose={() => setShowFlashcards(false)} />
        {showQuiz && (
          <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl relative">
              <button
                aria-label="Fechar"
                className="absolute top-3 right-3 text-2xl font-bold"
                onClick={() => setShowQuiz(false)}
              >×</button>
              <iframe
                title="Quiz"
                src={`/quiz/${resumo.id}`}
                className="w-full h-[80vh] border-none rounded-b-xl"
              />
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default Resumo;
