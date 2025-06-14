
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/hooks/useQuiz";

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

  const alternativeColors = [
    "from-pink-400 to-purple-500",
    "from-blue-400 to-cyan-500", 
    "from-green-400 to-emerald-500",
    "from-orange-400 to-red-500"
  ];

  const alternativeEmojis = ["🅰️", "🅱️", "🅾️", "🆔"];

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-4 border-yellow-200 shadow-2xl">
        <CardContent className="p-8">
          {/* Progresso visual */}
          <div className="flex justify-center mb-6">
            <div className="flex gap-2">
              {quizzes.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    idx < current 
                      ? 'bg-green-500 scale-110' 
                      : idx === current 
                      ? 'bg-blue-500 scale-125 animate-pulse' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-2xl font-bold mb-3 text-purple-700 flex items-center justify-center gap-3">
              <span className="text-3xl">🤔</span>
              Pergunta {current + 1} de {quizzes.length}
              <span className="text-3xl">🎯</span>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-800 leading-relaxed">
                {quiz.pergunta}
              </h3>
            </div>
          </div>

          <div className="grid gap-4 mb-6">
            {quiz.alternativas.map((alt, idx) => (
              <Button
                key={idx}
                onClick={() => handleAlternativa(idx)}
                className={`
                  p-6 h-auto text-left justify-start transition-all duration-300 transform hover:scale-105
                  ${showFeedback
                    ? idx === quiz.correta
                      ? "bg-gradient-to-r from-green-400 to-green-600 text-white shadow-xl scale-105"
                      : respostas[current] === idx
                      ? acertou
                        ? "bg-gradient-to-r from-green-400 to-green-600 text-white shadow-xl"
                        : "bg-gradient-to-r from-red-400 to-red-600 text-white shadow-xl"
                      : "bg-gray-100 text-gray-500"
                    : `bg-gradient-to-r ${alternativeColors[idx]} text-white shadow-lg hover:shadow-xl`
                  }
                `}
                disabled={showFeedback}
                size="lg"
              >
                <div className="flex items-center gap-4 w-full">
                  <span className="text-2xl">{alternativeEmojis[idx]}</span>
                  <span className="text-lg font-semibold flex-1">{alt}</span>
                  {showFeedback && idx === quiz.correta && (
                    <span className="text-2xl animate-bounce">✅</span>
                  )}
                  {showFeedback && respostas[current] === idx && !acertou && idx !== quiz.correta && (
                    <span className="text-2xl animate-bounce">❌</span>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {showFeedback && (
            <div className={`mt-6 p-6 rounded-xl shadow-lg border-2 transition-all duration-500 ${
                acertou
                  ? "bg-gradient-to-r from-green-100 to-emerald-100 border-green-300"
                  : "bg-gradient-to-r from-red-100 to-pink-100 border-red-300"
              }`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">
                  {acertou ? "🎉" : "📚"}
                </span>
                <div className="font-bold text-xl">
                  {acertou ? (
                    <span className="text-green-700">🏆 Parabéns! Você acertou!</span>
                  ) : (
                    <span className="text-red-700">📖 Ops! Vamos aprender juntos!</span>
                  )}
                </div>
              </div>
              
              {!acertou && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    <strong className="text-purple-600">💡 Explicação:</strong> {explanation}
                  </p>
                </div>
              )}
              
              <Button
                onClick={next}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                size="lg"
              >
                {current + 1 === quizzes.length ? (
                  <>🏁 Ver Resultado Final</>
                ) : (
                  <>➡️ Próxima Pergunta</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200">
          <span className="text-sm font-semibold text-gray-600">
            Pergunta {current + 1} de {quizzes.length}
          </span>
          <div className="w-16 bg-gray-200 rounded-full h-2 ml-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((current + 1) / quizzes.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPlay;
