import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuiz } from "@/hooks/useQuiz";
import { useSummary } from "@/hooks/useSummary";
import QuizGeneratorButton from "@/components/QuizGeneratorButton";
import QuizSession from "@/components/QuizSession";
import QuizResult from "@/components/QuizResult";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QuizPage = () => {
  const { resumoId } = useParams();
  const navigate = useNavigate();
  const { getResumoById } = useSummary();
  const { toast } = useToast();
  const [resumo, setResumo] = useState<any>(null);
  const {
    quizzes,
    respostas,
    fetchQuizzes,
    generateQuiz,
    enviarResposta,
    resetRespostas,
    loading: quizLoading
  } = useQuiz(resumoId!);
  const [status, setStatus] = useState<"idle" | "playing" | "done">("idle");
  const [ready, setReady] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (resumoId) {
      console.log('🎯 Quiz page loaded with resumoId:', resumoId);
      fetchResumoAndQuizzes();
    } else {
      console.error('❌ No resumoId provided');
      setError("ID do resumo não fornecido.");
    }
    // eslint-disable-next-line
  }, [resumoId]);

  useEffect(() => {
    // Automaticamente iniciar o quiz quando as questões estiverem prontas
    if (quizzes.length > 0 && status === "idle") {
      console.log('🚀 Quiz pronto! Iniciando automaticamente...');
      setStatus("playing");
    }
  }, [quizzes, status]);

  const fetchResumoAndQuizzes = async () => {
    try {
      setReady(false);
      setError("");
      console.log('📚 Carregando resumo com ID:', resumoId);
      
      const r = await getResumoById(resumoId!);
      
      if (!r) {
        console.error('❌ Resumo não encontrado para ID:', resumoId);
        setError("Resumo não encontrado.");
        return;
      }
      
      console.log('✅ Resumo carregado:', r.id);
      setResumo(r);
      
      console.log('🔍 Carregando quizzes existentes...');
      await fetchQuizzes();
      
      setReady(true);
    } catch (error) {
      console.error('💥 Erro ao carregar dados:', error);
      setError("Erro ao carregar o resumo.");
    }
  };

  const handleGerarQuiz = async () => {
    if (!resumo) {
      toast({
        title: "Erro",
        description: "Resumo não encontrado.",
        variant: "destructive",
      });
      return;
    }
    
    setError("");
    console.log('🎯 Gerando quiz para resumo:', resumo.id);
    
    toast({
      title: "🎯 Gerando seu quiz...",
      description: "A IA está criando perguntas especiais para você!",
    });
    
    const success = await generateQuiz(resumo.resumo_gerado);
    if (success) {
      toast({
        title: "🎉 Quiz pronto!",
        description: "Prepare-se para o desafio!",
      });
      // O useEffect vai automaticamente mudar para "playing"
    } else {
      setError("Não foi possível gerar o quiz. Verifique se há créditos na API OpenAI e tente novamente.");
    }
  };

  const handleResponder = async (quizId: string, alt: number) => {
    const resp = await enviarResposta(quizId, alt);
    return resp;
  };

  const handleFinish = () => {
    // Calcular acertos a partir do array de respostas
    const count = respostas.reduce((acc, resp) => acc + (resp.acertou ? 1 : 0), 0);
    setAcertos(count);
    setStatus("done");
  };

  const handleRestart = async () => {
    resetRespostas();
    setStatus("playing");
    await fetchQuizzes();
  };

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
          <Header />
          <div className="container mx-auto py-8 px-4">
            <Button
              variant="outline"
              className="mb-4 flex items-center gap-2"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            
            <Card className="max-w-lg mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-6 w-6" />
                  Ops! Algo deu errado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} className="w-full">
                  Tentar Novamente
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!ready) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <Card className="p-8">
            <CardContent className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-blue-800 mb-2">Preparando seu quiz...</h2>
              <p className="text-gray-600">Estamos carregando tudo para você! 🎯</p>
            </CardContent>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  if (!resumo) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50">
          <Header />
          <div className="container mx-auto py-8 px-4">
            <div className="text-center max-w-lg mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold mb-4">Resumo não encontrado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">O resumo que você está tentando acessar não foi encontrado.</p>
                  <Button onClick={() => navigate('/')} className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar ao Início
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <Button
            variant="outline"
            className="mb-6 flex items-center gap-2 hover:bg-purple-50"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              🎯 Quiz do Resumo
            </h1>
            <p className="text-xl text-gray-700">Teste seus conhecimentos de forma divertida!</p>
          </div>

          {/* Mostrar o resumo de forma compacta */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                📚 Conteúdo do Resumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-40 overflow-y-auto bg-white rounded-lg p-4 border">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {resumo.resumo_gerado}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Estados do Quiz */}
          {quizzes.length === 0 && status === "idle" ? (
            <div className="text-center">
              <Card className="max-w-lg mx-auto bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-orange-800 flex items-center justify-center gap-2">
                    🎪 Vamos criar seu quiz!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-700 mb-6 text-lg">
                    Clique no botão abaixo para que a IA crie perguntas especiais sobre este resumo!
                  </p>
                  <QuizGeneratorButton isGenerating={quizLoading} onGenerate={handleGerarQuiz} />
                </CardContent>
              </Card>
            </div>
          ) : status === "playing" ? (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-purple-700 flex items-center justify-center gap-2">
                  🎮 Hora do Quiz!
                </h2>
                <p className="text-lg text-gray-600 mt-2">Responda com calma e boa sorte! 🍀</p>
              </div>
              <QuizSession quizzes={quizzes} onComplete={handleFinish} />
            </div>
          ) : (
            <QuizResult acertos={acertos} total={quizzes.length} onRestart={handleRestart} />
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default QuizPage;
