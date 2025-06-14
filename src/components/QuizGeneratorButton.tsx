
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizGeneratorButtonProps {
  isGenerating: boolean;
  onGenerate: () => void;
}

const QuizGeneratorButton = ({ isGenerating, onGenerate }: QuizGeneratorButtonProps) => (
  <Button
    className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
    onClick={onGenerate}
    size="lg"
    disabled={isGenerating}
  >
    {isGenerating ? (
      <>
        <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Gerando Quiz...
      </>
    ) : (
      <>
        <Sparkles className="h-5 w-5 mr-2" /> Gerar Quiz de IA
      </>
    )}
  </Button>
);

export default QuizGeneratorButton;
