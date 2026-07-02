import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileArchive, 
  Eye, 
  FileText, 
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface EnhancedUploadProgressProps {
  progress: number;
  currentStep: string;
  totalFiles: number;
  stage?: 'preparing' | 'extracting' | 'uploading' | 'ocr' | 'summary' | 'complete';
  currentBatch?: number;
  totalBatches?: number;
  successfulImages?: number;
  failedImages?: number;
  currentImageIndex?: number; // New: Current image being processed
  estimatedTimeRemaining?: number; // New: Estimated time in seconds
}

const EnhancedUploadProgress: React.FC<EnhancedUploadProgressProps> = ({
  progress,
  currentStep,
  totalFiles,
  stage,
  currentBatch,
  totalBatches,
  successfulImages = 0,
  failedImages = 0
}) => {
  const getStageIcon = (step: string) => {
    if (step.includes('Extraindo')) return FileArchive;
    if (step.includes('Enviando') || step.includes('upload')) return Upload;
    if (step.includes('OCR') || step.includes('analisando')) return Eye;
    if (step.includes('resumo') || step.includes('Gerando')) return FileText;
    if (step.includes('Concluído')) return CheckCircle2;
    return Loader2;
  };

  const StageIcon = getStageIcon(currentStep);
  const isComplete = progress >= 100;
  const isLoading = !isComplete;

  const stages = [
    { name: 'Upload', min: 0, max: 20, icon: Upload },
    { name: 'OCR', min: 20, max: 80, icon: Eye },
    { name: 'Resumo', min: 80, max: 100, icon: FileText },
  ];

  const getCurrentStage = () => {
    for (const stage of stages) {
      if (progress >= stage.min && progress < stage.max) {
        return stage;
      }
    }
    return stages[stages.length - 1];
  };

  const currentStage = getCurrentStage();

  return (
    <Card className="p-6 bg-muted/50 border-blue-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isComplete ? 'bg-green-500' : 'bg-primary/50'}`}>
              <StageIcon className={`w-5 h-5 text-white ${isLoading ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Processando {totalFiles} arquivo{totalFiles !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-muted-foreground">{currentStep}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {Math.round(progress)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {isComplete ? 'Concluído' : 'Processando'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className="h-3 bg-white/50"
          />
          
          {/* Stage indicators */}
          <div className="flex justify-between text-xs text-muted-foreground">
            {stages.map((stage, index) => {
              const StageIcon = stage.icon;
              const isActive = progress >= stage.min && progress < stage.max;
              const isCompleted = progress >= stage.max;
              
              return (
                <div 
                  key={stage.name}
                  className={`flex items-center space-x-1 ${
                    isActive ? 'text-primary font-medium' : 
                    isCompleted ? 'text-green-600' : 'text-muted-foreground/70'
                  }`}
                >
                  <StageIcon className="w-4 h-4" />
                  <span>{stage.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current processing info - More detailed */}
        {stage === 'ocr' && successfulImages > 0 && (
          <div className="bg-white/70 rounded-lg p-3 text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground/80">Processando imagem:</span>
              <span className="text-primary font-bold">{successfulImages + 1} de {totalFiles}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(successfulImages / totalFiles) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Batch info */}
        {currentBatch && totalBatches && totalBatches > 1 && (
          <div className="text-xs text-center text-muted-foreground bg-white/50 rounded px-3 py-2">
            Processando lote {currentBatch} de {totalBatches}
          </div>
        )}

        {/* Detailed progress info */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/50">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {successfulImages}
            </div>
            <div className="text-xs text-muted-foreground">Processadas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {totalFiles - successfulImages - failedImages}
            </div>
            <div className="text-xs text-muted-foreground">Restantes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {progress > 80 ? '✓' : '○'}
            </div>
            <div className="text-xs text-muted-foreground">Resumo</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedUploadProgress;