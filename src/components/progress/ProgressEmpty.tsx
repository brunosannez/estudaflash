
import { Button } from '@/components/ui/button';
import { RefreshCw, BookOpen, Brain, Target } from 'lucide-react';

interface ProgressEmptyProps {
  onRefresh: () => void;
}

const ProgressEmpty = ({ onRefresh }: ProgressEmptyProps) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-6 max-w-md mx-auto">
        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
          <Target className="h-10 w-10 text-primary" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-foreground">
            Comece sua jornada de aprendizado! 🚀
          </h3>
          <p className="text-muted-foreground text-lg">
            Seu progresso será exibido aqui assim que você começar a usar o Estuda Flash.
          </p>
        </div>

        <div className="bg-muted/50 p-6 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-foreground mb-3">Como ganhar XP:</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-500" />
              <span>📚 +5 XP por cada flashcard estudado</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <span>✅ +10 XP por resposta correta em quiz</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-orange-500" />
              <span>📝 +2 XP por tentativa em quiz</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={onRefresh}
          className="bg-primary hover:opacity-90 text-white font-bold px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Progresso
        </Button>
      </div>
    </div>
  );
};

export default ProgressEmpty;
