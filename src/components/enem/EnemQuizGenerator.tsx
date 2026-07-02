import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowLeft, BookOpen, Clock } from 'lucide-react';

interface EnemQuizGeneratorProps {
  resumoId: string;
  resumoContent: string;
  onGenerateQuiz: () => void;
  isGenerating: boolean;
  onBack?: () => void;
  hasExistingQuiz?: boolean;
}

export const EnemQuizGenerator: React.FC<EnemQuizGeneratorProps> = ({
  resumoId,
  resumoContent,
  onGenerateQuiz,
  isGenerating,
  onBack,
  hasExistingQuiz = false
}) => {
  const wordCount = resumoContent.split(' ').length;
  
  // Calculate expected questions based on word count
  const getExpectedQuestions = (words: number) => {
    if (words <= 300) return { min: 6, max: 8 };
    if (words <= 600) return { min: 10, max: 14 };
    if (words <= 900) return { min: 14, max: 18 };
    return { min: 18, max: 24 };
  };

  const expectedQuestions = getExpectedQuestions(wordCount);
  const canGenerate = resumoContent.length >= 50; // Minimum content length

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Target className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">
          {hasExistingQuiz ? 'Gerar Novo Quiz ENEM' : 'Quiz ENEM'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {hasExistingQuiz ? (
          <div className="p-4 rounded-lg bg-primary/5 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Atenção:</strong> Já existe um quiz para este resumo. 
              Gerar um novo quiz irá criar questões diferentes baseadas no mesmo conteúdo.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              Este resumo ainda não possui um quiz ENEM. Clique no botão abaixo para gerar 
              questões no formato do ENEM baseadas no conteúdo.
            </p>
          </div>
        )}

        {/* Content Analysis */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="font-semibold">{wordCount}</div>
            <div className="text-sm text-muted-foreground">Palavras</div>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="font-semibold">
              {expectedQuestions.min}-{expectedQuestions.max}
            </div>
            <div className="text-sm text-muted-foreground">Questões Esperadas</div>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="font-semibold">
              {Math.ceil((expectedQuestions.min + expectedQuestions.max) / 2 * 2)}min
            </div>
            <div className="text-sm text-muted-foreground">Tempo Estimado</div>
          </div>
        </div>

        {/* Quiz Format Info */}
        <div className="space-y-3">
          <h4 className="font-medium">Formato das Questões:</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
              <Badge variant="secondary" className="mt-1">50%</Badge>
              <div className="flex-1">
                <div className="font-medium text-sm">Objetivas</div>
                <div className="text-xs text-muted-foreground">
                  Múltipla escolha com enunciados contextualizados estilo ENEM
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
              <Badge variant="secondary" className="mt-1">50%</Badge>
              <div className="flex-1">
                <div className="font-medium text-sm">V/F Sequenciais</div>
                <div className="text-xs text-muted-foreground">
                  Verdadeiro/Falso com múltiplas afirmações
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Resumo
            </Button>
          )}
          
          <Button 
            onClick={onGenerateQuiz} 
            disabled={!canGenerate || isGenerating}
            size="lg"
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Gerando Quiz ENEM...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                {hasExistingQuiz ? 'Gerar Novo Quiz' : 'Gerar Quiz ENEM'}
              </>
            )}
          </Button>
        </div>

        {!canGenerate && (
          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <strong>Conteúdo insuficiente:</strong> O resumo precisa ter pelo menos 50 caracteres para gerar um quiz.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};