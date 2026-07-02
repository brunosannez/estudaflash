
import PageLayout from '@/components/navigation/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizHistoryViewEmpty = () => {
  const navigate = useNavigate();
  
  return (
    <PageLayout>
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">📚</div>
          <h2 className="text-2xl font-bold text-foreground/80 mb-4">
            Quiz não encontrado
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Este quiz pode ter sido excluído ou você não tem permissão para visualizá-lo.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => navigate('/quiz-history')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Histórico
            </Button>
            <Button 
              onClick={() => navigate('/my-summaries')}
              className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Novo Quiz
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default QuizHistoryViewEmpty;
