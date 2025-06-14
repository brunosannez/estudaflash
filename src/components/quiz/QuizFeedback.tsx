
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
    <div className="mt-6 space-y-4">
      {isCorrect ? (
        <div className="flex items-center text-green-600 font-semibold font-nunito bg-green-50 p-4 rounded-xl border-2 border-green-200">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <span className="block">🎉 Resposta Correta! +10 XP</span>
            {streakCount > 0 && (
              <span className="text-orange-600 text-sm">🔥 Sequência: {streakCount + 1}</span>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start text-red-600 font-semibold font-nunito bg-red-50 p-4 rounded-xl border-2 border-red-200">
            <XCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>💪 Boa tentativa! +2 XP pelo esforço</span>
          </div>
          
          {/* Explicação da resposta correta */}
          {explanation && (
            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 font-fredoka mb-2">
                    💡 Explicação da Resposta Correta:
                  </h4>
                  <p className="text-blue-700 font-nunito text-sm lg:text-base leading-relaxed">
                    <strong>Resposta correta: {alternativeStyles[correctAnswer].letter}</strong> - {alternatives[correctAnswer]}
                  </p>
                  <p className="text-blue-700 font-nunito text-sm lg:text-base leading-relaxed mt-2">
                    {explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizFeedback;
