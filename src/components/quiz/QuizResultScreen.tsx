
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuizResultScreenProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
}

const QuizResultScreen = ({ score, totalQuestions, onRestart }: QuizResultScreenProps) => {
  const navigate = useNavigate();
  const accuracy = Math.round((score / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardContent className="py-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-4">Quiz Concluído!</h2>
          <div className="space-y-2 mb-6">
            <p className="text-lg">
              Você acertou <span className="font-bold text-green-600">{score}</span> de {totalQuestions} questões
            </p>
            <p className="text-gray-600">
              Aproveitamento: {accuracy}%
            </p>
          </div>
          <div className="space-y-3">
            <Button 
              onClick={onRestart}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              🔄 Tentar Novamente
            </Button>
            <Button 
              onClick={() => navigate('/my-summaries')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Resumos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResultScreen;
