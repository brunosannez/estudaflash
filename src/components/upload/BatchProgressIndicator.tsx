import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface BatchProgress {
  currentBatch: number;
  totalBatches: number;
  processedImages: number;
  totalImages: number;
  currentBatchProgress: number;
}

interface BatchProgressIndicatorProps {
  batchProgress: BatchProgress | null;
  isProcessing: boolean;
}

export const BatchProgressIndicator = ({ batchProgress, isProcessing }: BatchProgressIndicatorProps) => {
  if (!batchProgress && !isProcessing) {
    return null;
  }

  const overallProgress = batchProgress 
    ? ((batchProgress.processedImages / batchProgress.totalImages) * 100)
    : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Processando Imagens em Lotes
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Processamento Concluído
            </>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {batchProgress && (
          <>
            {/* Progresso Geral */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progresso Geral</span>
                <span className="text-muted-foreground">
                  {batchProgress.processedImages} / {batchProgress.totalImages} imagens
                </span>
              </div>
              <Progress value={overallProgress} className="h-3" />
              <div className="text-center text-sm text-muted-foreground">
                {Math.round(overallProgress)}% concluído
              </div>
            </div>

            {/* Progresso do Lote Atual */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  Lote {batchProgress.currentBatch + 1} de {batchProgress.totalBatches}
                </span>
                <span className="text-muted-foreground">
                  {Math.round(batchProgress.currentBatchProgress)}%
                </span>
              </div>
              <Progress value={batchProgress.currentBatchProgress} className="h-2" />
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-primary">
                  {batchProgress.totalBatches}
                </div>
                <div className="text-xs text-muted-foreground">Lotes Total</div>
              </div>
              
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {batchProgress.processedImages}
                </div>
                <div className="text-xs text-muted-foreground">Processadas</div>
              </div>
            </div>

            {/* Dica sobre Planos */}
            {batchProgress.totalBatches > 1 && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Processamento em Lotes</p>
                  <p>
                    Suas imagens estão sendo processadas em lotes devido aos limites do plano. 
                    Faça upgrade para PRO ou EDU para processar mais imagens simultâneas!
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};