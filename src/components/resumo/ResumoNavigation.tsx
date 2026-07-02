
import { Button } from '@/components/ui/button';
import { Home, Brain, BookOpen, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResumoNavigation = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 pt-4 border-t">
      <Button 
        onClick={() => navigate('/')}
        variant="outline"
        size="sm"
      >
        <Home className="h-4 w-4 mr-2" />
        Início
      </Button>
      <Button 
        onClick={() => navigate('/my-flashcards')}
        variant="outline"
        size="sm"
      >
        <Brain className="h-4 w-4 mr-2" />
        Meus Flashcards
      </Button>
      <Button 
        onClick={() => navigate('/my-summaries')}
        variant="outline"
        size="sm"
      >
        <BookOpen className="h-4 w-4 mr-2" />
        Meus Resumos
      </Button>
      <Button 
        onClick={() => navigate('/my-progress')}
        variant="outline"
        size="sm"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Progresso
      </Button>
    </div>
  );
};

export default ResumoNavigation;
