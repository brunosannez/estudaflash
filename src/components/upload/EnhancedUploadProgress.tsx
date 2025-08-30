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
}

const EnhancedUploadProgress: React.FC<EnhancedUploadProgressProps> = ({
  progress,
  currentStep,
  totalFiles
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
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}>
              <StageIcon className={`w-5 h-5 text-white ${isLoading ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                Processando {totalFiles} arquivo{totalFiles !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-gray-600">{currentStep}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(progress)}%
            </div>
            <div className="text-sm text-gray-500">
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
          <div className="flex justify-between text-xs text-gray-500">
            {stages.map((stage, index) => {
              const StageIcon = stage.icon;
              const isActive = progress >= stage.min && progress < stage.max;
              const isCompleted = progress >= stage.max;
              
              return (
                <div 
                  key={stage.name}
                  className={`flex items-center space-x-1 ${
                    isActive ? 'text-blue-600 font-medium' : 
                    isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <StageIcon className="w-4 h-4" />
                  <span>{stage.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed progress info */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/50">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {Math.min(Math.round(progress * 0.2), totalFiles)}
            </div>
            <div className="text-xs text-gray-600">Enviadas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {progress > 20 ? Math.min(Math.round((progress - 20) * 0.0125 * totalFiles), totalFiles) : 0}
            </div>
            <div className="text-xs text-gray-600">Analisadas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {progress > 80 ? '1' : '0'}
            </div>
            <div className="text-xs text-gray-600">Resumo</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedUploadProgress;