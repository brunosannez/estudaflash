
import { CheckCircle, Circle } from 'lucide-react';

interface FormStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  isMinor: boolean;
}

const FormStepIndicator = ({ currentStep, totalSteps, isMinor }: FormStepIndicatorProps) => {
  const steps = [
    { number: 1, title: 'Dados Básicos', emoji: '📧' },
    { number: 2, title: 'Informações Pessoais', emoji: '👤' },
    ...(isMinor ? [{ number: 3, title: 'Responsável', emoji: '👨‍👩‍👧' }] : []),
    { number: totalSteps, title: 'Plano', emoji: '📋' }
  ];

  return (
    <div className="flex justify-center mb-6">
      <div className="flex items-center space-x-2 sm:space-x-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                currentStep >= step.number
                  ? 'bg-primary/50 border-purple-500 text-white'
                  : 'bg-card border-input text-muted-foreground/70'
              }`}>
                {currentStep > step.number ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm">{step.emoji}</span>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium text-center max-w-16 sm:max-w-none ${
                currentStep >= step.number ? 'text-primary' : 'text-muted-foreground/70'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 sm:w-12 h-0.5 mx-2 ${
                currentStep > step.number ? 'bg-primary/50' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormStepIndicator;
