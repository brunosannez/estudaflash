
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
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                currentStep >= step.number
                  ? 'bg-purple-500 border-purple-500 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {currentStep > step.number ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="text-lg">{step.emoji}</span>
                )}
              </div>
              <span className={`text-xs mt-2 font-medium ${
                currentStep >= step.number ? 'text-purple-600' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-purple-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormStepIndicator;
