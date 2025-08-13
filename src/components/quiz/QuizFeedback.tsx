
import { CheckCircle, XCircle } from "lucide-react";

interface QuizFeedbackProps {
  isCorrect: boolean;
  explanation?: string;
  correctAnswer: number;
  alternatives: string[];
}

const QuizFeedback = ({ isCorrect, explanation, correctAnswer, alternatives }: QuizFeedbackProps) => {
  const alternativeLabels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className={`p-6 rounded-xl mb-6 ${isCorrect ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border-3 shadow-lg`}>
      <div className="flex items-start space-x-3">
        {isCorrect ? (
          <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-full">
            <XCircle className="h-6 w-6 text-white" />
          </div>
        )}
        <div>
          <h4 className={`font-bold text-lg mb-3 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
            {isCorrect ? '🎉 Parabéns! Resposta Correta!' : '💡 Resposta Incorreta'}
          </h4>
          {!isCorrect && (
            <div className="bg-white/60 rounded-lg p-3 mb-3 border-l-4 border-green-500">
              <p className="text-gray-800 font-medium">
                <strong className="text-green-700">✓ Resposta correta:</strong> {alternativeLabels[correctAnswer]} - {alternatives[correctAnswer]}
              </p>
            </div>
          )}
          {explanation && (
            <div className="bg-white/60 rounded-lg p-3 border-l-4 border-blue-500">
              <p className={`text-sm font-medium ${isCorrect ? 'text-gray-700' : 'text-gray-700'}`}>
                <strong className="text-blue-700">💡 Explicação:</strong> {explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizFeedback;
