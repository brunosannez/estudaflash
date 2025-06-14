
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock } from 'lucide-react';
import ResumoContent from '@/components/ResumoContent';
import ResumoActions from './ResumoActions';
import ResumoNavigation from './ResumoNavigation';

interface ResumoMainContentProps {
  content: string;
  createdDate: string;
  onGenerateAutoFlashcards: () => void;
  onManageFlashcards: () => void;
  onGenerateQuiz: () => void;
  isGeneratingFlashcards: boolean;
  isGeneratingQuiz: boolean;
}

const ResumoMainContent = ({
  content,
  createdDate,
  onGenerateAutoFlashcards,
  onManageFlashcards,
  onGenerateQuiz,
  isGeneratingFlashcards,
  isGeneratingQuiz
}: ResumoMainContentProps) => {
  return (
    <Card className="overflow-hidden shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          Conteúdo do Resumo
        </CardTitle>
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Gerado em {createdDate}
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="p-8">
          <ResumoContent content={content} />
        </div>

        <ResumoActions
          onGenerateAutoFlashcards={onGenerateAutoFlashcards}
          onManageFlashcards={onManageFlashcards}
          onGenerateQuiz={onGenerateQuiz}
          isGeneratingFlashcards={isGeneratingFlashcards}
          isGeneratingQuiz={isGeneratingQuiz}
        />

        <ResumoNavigation />
      </CardContent>
    </Card>
  );
};

export default ResumoMainContent;
