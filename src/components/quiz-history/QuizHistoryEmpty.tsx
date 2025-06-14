
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuizHistoryEmptyProps {
  onCreateFirstQuiz: () => void;
}

const QuizHistoryEmpty = ({ onCreateFirstQuiz }: QuizHistoryEmptyProps) => {
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-gray-600">
          📚 Nenhum quiz encontrado
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-600 mb-6">
          Você ainda não fez nenhum quiz. Que tal começar agora?
        </p>
        <Button 
          onClick={onCreateFirstQuiz}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          Criar Primeiro Quiz
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuizHistoryEmpty;
