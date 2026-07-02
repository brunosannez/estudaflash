
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface QuizHistoryHeaderProps {
  onGoBack: () => void;
}

const QuizHistoryHeader = ({ onGoBack }: QuizHistoryHeaderProps) => {
  return (
    <>
      <Button
        variant="outline"
        className="mb-6 flex items-center gap-2 hover:bg-primary/5"
        onClick={onGoBack}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
          <span className="text-5xl">📊</span>
          Histórico de Quizzes
          <span className="text-5xl">📈</span>
        </h1>
        <p className="text-xl text-foreground/80">Veja seu progresso e refaça seus quizzes favoritos!</p>
      </div>
    </>
  );
};

export default QuizHistoryHeader;
