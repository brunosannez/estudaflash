
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Brain, FileText, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProgressActionsCard = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2 text-blue-600" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={() => navigate('/')}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Home className="h-4 w-4 mr-2" />
          Início
        </Button>
        <Button 
          onClick={() => navigate('/meus-resumos')}
          variant="outline" 
          className="w-full"
        >
          <FileText className="h-4 w-4 mr-2" />
          Meus Resumos
        </Button>
        <Button 
          onClick={() => navigate('/meus-flashcards')}
          variant="outline" 
          className="w-full"
        >
          <Brain className="h-4 w-4 mr-2" />
          Estudar Flashcards
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProgressActionsCard;
