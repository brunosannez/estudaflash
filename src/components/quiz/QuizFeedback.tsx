
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
    <div className={`p-4 rounded-xl mb-6 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2`}>
      <div className="flex items-start space-x-3">
        {isCorrect ? (
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
        )}
        <div>
          <h4 className={`font-semibold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
            {isCorrect ? '🎉 Correto!' : '💡 Resposta Incorreta'}
          </h4>
          {!isCorrect && (
            <p className="text-red-700 mb-2">
              <strong>Resposta correta:</strong> {alternativeLabels[correctAnswer]} - {alternatives[correctAnswer]}
            </p>
          )}
          {explanation && (
            <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
              <strong>Explicação:</strong> {explanation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizFeedback;
