
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Brain, Target, Lightbulb } from 'lucide-react';
import ResumoContent from '@/components/ResumoContent';
import PageLayout from '@/components/navigation/PageLayout';

interface ResumoPageContentProps {
  resumo: any;
  existingMindMap: any;
  mindMapLoading: boolean;
  isGeneratingFlashcards: boolean;
  isGeneratingQuiz: boolean;
  isGeneratingMindMap: boolean;
  onGenerateFlashcards: () => void;
  onGenerateQuiz: () => void;
  onGenerateMindMap: () => void;
  onViewMindMap: () => void;
}

const ResumoPageContent = ({
  resumo,
  existingMindMap,
  mindMapLoading,
  isGeneratingFlashcards,
  isGeneratingQuiz,
  isGeneratingMindMap,
  onGenerateFlashcards,
  onGenerateQuiz,
  onGenerateMindMap,
  onViewMindMap
}: ResumoPageContentProps) => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/my-summaries')} 
            variant="ghost" 
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {resumo.custom_name || 'Resumo'}
            </h1>
            <p className="text-muted-foreground">
              Criado em {new Date(resumo.data_criacao).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={onGenerateFlashcards}
            disabled={isGeneratingFlashcards}
            className="bg-primary hover:bg-primary/90"
          >
            {isGeneratingFlashcards ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Gerar Flashcards
              </>
            )}
          </Button>
          
          <Button 
            onClick={onGenerateQuiz} 
            variant="outline"
            disabled={isGeneratingQuiz}
          >
            {isGeneratingQuiz ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Fazer Quiz
              </>
            )}
          </Button>

          {/* Mind Map Button */}
          {existingMindMap ? (
            <Button 
              onClick={onViewMindMap}
              className="bg-primary hover:bg-primary/90"
              disabled={mindMapLoading}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Ver Mapa Mental
            </Button>
          ) : (
            <Button 
              onClick={onGenerateMindMap}
              disabled={isGeneratingMindMap || mindMapLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isGeneratingMindMap ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : mindMapLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Criar Mapa Mental
                </>
              )}
            </Button>
          )}
        </div>

        {/* Content */}
        <ResumoContent content={resumo.resumo_gerado} />
      </div>
    </PageLayout>
  );
};

export default ResumoPageContent;
