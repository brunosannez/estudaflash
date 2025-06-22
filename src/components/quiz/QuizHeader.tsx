
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuizHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  onBack: () => void;
}

const QuizHeader = ({ currentIndex, totalQuestions, onBack }: QuizHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={onBack}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="text-sm font-medium text-gray-600">
          {currentIndex + 1} de {totalQuestions}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default QuizHeader;
