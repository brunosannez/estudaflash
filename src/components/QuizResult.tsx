
import { Button } from "@/components/ui/button";

interface QuizResultProps {
  acertos: number;
  total: number;
  onRestart: () => void;
}

const QuizResult = ({ acertos, total, onRestart }: QuizResultProps) => {
  const pct = Math.round((acertos / total) * 100);
  return (
    <div className="max-w-md mx-auto p-8 rounded-xl border bg-white shadow-inner text-center mt-6">
      <div className="text-3xl font-bold mb-2">Resultados</div>
      <div className="mb-4">
        Você acertou <span className="font-semibold text-green-600">{acertos}</span> de {total} perguntas
        <br />
        <span className="text-xl font-bold">{pct}%</span> de acerto
      </div>
      <Button onClick={onRestart} className="bg-blue-600 hover:bg-blue-700 text-white" size="lg">
        Refazer Quiz
      </Button>
    </div>
  );
};

export default QuizResult;
