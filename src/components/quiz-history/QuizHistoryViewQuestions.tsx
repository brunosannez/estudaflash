
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizQuestion {
  pergunta: string;
  alternativas: string[];
  resposta_correta: number;
  explicacao: string;
  resposta_usuario?: number;
  acertou: boolean;
}

interface QuizHistoryViewQuestionsProps {
  questions: QuizQuestion[];
}

const QuizHistoryViewQuestions = ({ questions }: QuizHistoryViewQuestionsProps) => {
  const getAnswerClass = (questionIndex: number, alternativeIndex: number) => {
    const question = questions[questionIndex];
    if (!question) return '';

    const isCorrectAnswer = alternativeIndex === question.resposta_correta;
    const isUserAnswer = alternativeIndex === question.resposta_usuario;

    if (isCorrectAnswer && isUserAnswer) {
      return 'bg-green-100 border-green-500 text-green-800'; // Correto e selecionado
    } else if (isCorrectAnswer) {
      return 'bg-green-50 border-green-300 text-green-700'; // Correto mas não selecionado
    } else if (isUserAnswer) {
      return 'bg-red-100 border-red-500 text-red-800'; // Incorreto e selecionado
    }
    return 'bg-gray-50 border-gray-200 text-gray-600'; // Nem correto nem selecionado
  };

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Nenhuma questão encontrada para este quiz.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question, questionIndex) => (
        <Card key={questionIndex}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              {question.acertou ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Questão {questionIndex + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-800 font-medium">{question.pergunta}</p>
            
            <div className="grid gap-2">
              {question.alternativas?.map((alternativa, altIndex) => (
                <div
                  key={altIndex}
                  className={`p-3 rounded-lg border-2 ${getAnswerClass(questionIndex, altIndex)}`}
                >
                  <span className="font-medium">{String.fromCharCode(65 + altIndex)}) </span>
                  {alternativa}
                  {altIndex === question.resposta_correta && (
                    <span className="ml-2 text-green-600 font-bold">✓ Correta</span>
                  )}
                  {altIndex === question.resposta_usuario && altIndex !== question.resposta_correta && (
                    <span className="ml-2 text-red-600 font-bold">✗ Sua resposta</span>
                  )}
                </div>
              )) || (
                <p className="text-gray-500 italic">Alternativas não disponíveis</p>
              )}
            </div>

            {question.explicacao && (
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Explicação:</h4>
                <p className="text-blue-700">{question.explicacao}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuizHistoryViewQuestions;
