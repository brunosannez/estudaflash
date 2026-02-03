
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
          <Zap className="h-5 w-5 mr-2 text-muted-foreground" />
          Ações rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={() => navigate('/')}
          className="w-full justify-start"
        >
          <Home className="h-4 w-4 mr-2" />
          Ir para o início
        </Button>
        <Button 
          onClick={() => navigate('/my-summaries')}
          variant="outline"
          className="w-full justify-start"
        >
          <FileText className="h-4 w-4 mr-2" />
          Ver meus resumos
        </Button>
        <Button 
          onClick={() => navigate('/my-flashcards')}
          variant="outline"
          className="w-full justify-start"
        >
          <Brain className="h-4 w-4 mr-2" />
          Estudar flashcards
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProgressActionsCard;
