import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuiz } from "@/hooks/useQuiz";
import { useSummary } from "@/hooks/useSummary";
import QuizGeneratorButton from "@/components/QuizGeneratorButton";
import QuizPlay from "@/components/QuizPlay";
import QuizResult from "@/components/QuizResult";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    if (resumoId) {
      console.log('Quiz page loaded with resumoId:', resumoId);
      fetchResumoAndQuizzes();
    } else {
      console.error('No resumoId provided');
      toast({
        title: "Erro",
        description: "ID do resumo não fornecido.",
        variant: "destructive",
      });
      navigate('/');
    }
    // eslint-disable-next-line
  }, [resumoId]);

  const fetchResumoAndQuizzes = async () => {
    try {
      setReady(false);
      console.log('Carregando resumo com ID:', resumoId);
      
      const r = await getResumoById(resumoId!);
      
      if (!r) {
        console.error('Resumo não encontrado para ID:', resumoId);
        toast({
          title: "Erro",
          description: "Resumo não encontrado.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
      
      console.log('Resumo carregado:', r);
      setResumo(r);
      
      console.log('Carregando quizzes existentes...');
      await fetchQuizzes();
      
      setReady(true);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar o resumo.",
        variant: "destructive",
      });
      navigate('/');
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
    
    console.log('Gerando quiz para resumo:', resumo.id);
    const success = await generateQuiz(resumo.resumo_gerado);
    if (success) {
      setStatus("playing");
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

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p>Carregando quiz...</p>
        </div>
      </div>
    );
  }

  if (!resumo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Resumo não encontrado</h2>
          <p className="text-gray-600 mb-4">O resumo que você está tentando acessar não foi encontrado.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50">
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
          <h2 className="text-2xl font-bold mb-6">Quiz do Resumo</h2>
          <div className="mb-4">
            <div className="text-sm text-gray-700 bg-gray-50 border p-4 rounded-xl">
              <b>Resumo:</b>
              <pre className="text-gray-900 whitespace-pre-wrap mt-2">{resumo.resumo_gerado}</pre>
            </div>
          </div>
          {quizzes.length === 0 && status === "idle" ? (
            <QuizGeneratorButton isGenerating={quizLoading} onGenerate={handleGerarQuiz} />
          ) : status === "playing" ? (
            <QuizPlay quizzes={quizzes} onResponder={handleResponder} onFinish={handleFinish} />
          ) : (
            <QuizResult acertos={acertos} total={quizzes.length} onRestart={handleRestart} />
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default QuizPage;
