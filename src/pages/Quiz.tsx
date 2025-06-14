
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

const QuizPage = () => {
  const { resumoId } = useParams();
  const navigate = useNavigate();
  const { getResumo } = useSummary();
  const [resumo, setResumo] = useState<any>(null);
  const {
    quizzes,
    fetchQuizzes,
    generateQuiz,
    enviarResposta,
    resetRespostas,
  } = useQuiz(resumoId!);
  const [status, setStatus] = useState<"idle" | "playing" | "done">("idle");
  const [ready, setReady] = useState(false);
  const [acertos, setAcertos] = useState(0);

  useEffect(() => {
    if (resumoId) {
      fetchResumoAndQuizzes();
    }
    // eslint-disable-next-line
  }, [resumoId]);

  const fetchResumoAndQuizzes = async () => {
    setReady(false);
    const r = await getResumo(resumoId!);
    setResumo(r);
    await fetchQuizzes();
    setReady(true);
  };

  const handleGerarQuiz = async () => {
    if (!resumo) return;
    await generateQuiz(resumo.resumo_gerado);
    setStatus("playing");
  };

  const handleResponder = async (quizId: string, alt: number) => {
    const resp = await enviarResposta(quizId, alt);
    return resp;
  };

  const handleFinish = () => {
    setAcertos(
      quizzes.reduce((acc, q, idx) => {
        // TODO: pode-se buscar respostas para user scoring real
        return acc + (q.correta !== undefined && q.correta === q.resposta_selecionada ? 1 : 0);
      }, 0),
    );
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            onClick={() => navigate(-1)}
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
          {quizzes.length === 0 && status !== "playing" ? (
            <QuizGeneratorButton isGenerating={status === "playing"} onGenerate={handleGerarQuiz} />
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
