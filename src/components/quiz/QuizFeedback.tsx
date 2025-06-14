
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface QuizFeedbackProps {
  isCorrect: boolean;
  streakCount: number;
  explanation: string;
  correctAnswer: number;
  alternatives: string[];
}

const QuizFeedback = ({ 
  isCorrect, 
  streakCount, 
  explanation, 
  correctAnswer, 
  alternatives 
}: QuizFeedbackProps) => {
  const alternativeStyles = [
    { letter: "A" },
    { letter: "B" },
    { letter: "C" },
    { letter: "D" }
  ];

  return (
    <div className="mt-4 space-y-3">
      {isCorrect ? (
        <div className="flex items-center text-green-600 font-semibold font-nunito bg-green-50 p-3 rounded-xl border-2 border-green-200">
          <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <span className="block text-sm">🎉 Resposta Correta! +10 XP</span>
            {streakCount > 0 && (
              <span className="text-orange-600 text-xs">🔥 Sequência: {streakCount + 1}</span>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start text-red-600 font-semibold font-nunito bg-red-50 p-3 rounded-xl border-2 border-red-200">
            <XCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">💪 Boa tentativa! +2 XP pelo esforço</span>
          </div>
          
          {/* Explicação da resposta correta - sempre mostrar quando errar */}
          <div className="bg-blue-50 p-3 rounded-xl border-2 border-blue-200">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 font-fredoka mb-1 text-sm">
                  💡 Explicação da Resposta Correta:
                </h4>
                <p className="text-blue-700 font-nunito text-xs lg:text-sm leading-relaxed">
                  <strong>Resposta correta: {alternativeStyles[correctAnswer].letter}</strong> - {alternatives[correctAnswer]}
                </p>
                {explanation && (
                  <p className="text-blue-700 font-nunito text-xs lg:text-sm leading-relaxed mt-2">
                    {explanation}
                  </p>
                )}
                {!explanation && (
                  <p className="text-blue-600 font-nunito text-xs italic mt-1">
                    Explicação não disponível para esta pergunta.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizFeedback;
