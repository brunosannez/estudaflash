
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/hooks/useQuiz";
import QuizResult from "./QuizResult";

interface QuizPlayProps {
  quizzes: Quiz[];
  onResponder: (quizId: string, resposta: number) => Promise<any>;
  onFinish: () => void;
}

const QuizPlay = ({ quizzes, onResponder, onFinish }: QuizPlayProps) => {
  const [current, setCurrent] = useState(0);
  const [acertos, setAcertos] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [acertou, setAcertou] = useState<boolean | null>(null);
  const [explanation, setExplanation] = useState("");
  const [respostas, setRespostas] = useState<number[]>([]);

  if (!quizzes.length) return <div>Nenhuma pergunta disponível.</div>;
  const quiz = quizzes[current];

  const handleAlternativa = async (idx: number) => {
    const resp = await onResponder(quiz.id, idx);
    setAcertou(resp.acertou);
    setExplanation(resp.explicacao);
    setShowFeedback(true);
    setRespostas((prev) => {
      const arr = [...prev];
      arr[current] = idx;
      return arr;
    });
    if (resp.acertou) setAcertos([...acertos, current]);
  };

  const next = () => {
    setShowFeedback(false);
    setAcertou(null);
    setExplanation("");
    if (current + 1 < quizzes.length) {
      setCurrent(current + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="text-lg font-bold mb-2">Pergunta {current + 1}/{quizzes.length}</div>
          <div className="mb-4 text-base font-semibold">{quiz.pergunta}</div>
          <div className="grid gap-3 mb-4">
            {quiz.alternativas.map((alt, idx) => (
              <Button
                key={idx}
                onClick={() => handleAlternativa(idx)}
                className="block w-full"
                disabled={showFeedback}
                variant={
                  showFeedback
                    ? idx === quiz.correta
                      ? "default"
                      : respostas[current] === idx
                      ? acertou
                        ? "secondary"
                        : "destructive"
                      : "outline"
                    : "outline"
                }
              >
                {alt}
              </Button>
            ))}
          </div>
          {showFeedback && (
            <div className={`mt-3 p-3 rounded ${
                acertou
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}>
              <div className="font-bold mb-1">
                {acertou ? "Acertou!" : "Errou"}
              </div>
              {!acertou && (
                <div className="text-sm text-neutral-700">
                  <span className="font-semibold">Explicação: </span>
                  {explanation}
                </div>
              )}
              <Button
                onClick={next}
                className="mt-3"
                variant="outline"
                size="sm"
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="text-center text-xs text-gray-500">Pergunta {current + 1} de {quizzes.length}</div>
    </div>
  );
};

export default QuizPlay;
