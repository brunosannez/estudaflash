
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Brain, FileText, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { designColors } from '@/utils/designSystem';

const ProgressActionsCard = () => {
  const navigate = useNavigate();

  return (
    <Card className={designColors.cards.primary}>
      <CardHeader>
        <CardTitle className="flex items-center text-gray-700">
          <Zap className="h-5 w-5 mr-2 text-cyan-600" />
          🚀 Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={() => navigate('/')}
          className={`w-full ${designColors.buttons.secondary} text-white font-semibold ${designColors.animations.buttonHover}`}
        >
          <Home className="h-4 w-4 mr-2" />
          🏠 Início
        </Button>
        <Button 
          onClick={() => navigate('/meus-resumos')}
          variant="outline" 
          className="w-full border-2 border-cyan-300 text-gray-700 hover:bg-cyan-50"
        >
          <FileText className="h-4 w-4 mr-2" />
          📚 Meus Resumos
        </Button>
        <Button 
          onClick={() => navigate('/meus-flashcards')}
          variant="outline" 
          className="w-full border-2 border-green-300 text-gray-700 hover:bg-green-50"
        >
          <Brain className="h-4 w-4 mr-2" />
          🧠 Estudar Flashcards
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProgressActionsCard;
