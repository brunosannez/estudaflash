
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { ActivePlan } from '@/types/plans';

interface PlanCardProps {
  plan: ActivePlan;
  isSelected: boolean;
  onSelect: (planId: string) => void;
  showYearlyPrice: boolean;
}

const PlanCard = ({ plan, isSelected, onSelect, showYearlyPrice }: PlanCardProps) => {
  const price = showYearlyPrice ? plan.price_brl_yearly : plan.price_brl;
  const period = showYearlyPrice ? '/ano' : '/mês';

  const features = [
    `${plan.uploads_limit} uploads${period === '/mês' ? ' por mês' : ' por ano'}`,
    `${plan.summaries_limit} resumos${period === '/mês' ? ' por mês' : ' por ano'}`,
    `${plan.flashcards_limit} flashcards${period === '/mês' ? ' por mês' : ' por ano'}`,
    `${plan.quizzes_limit} quizzes${period === '/mês' ? ' por mês' : ' por ano'}`,
    `IA: ${plan.quiz_model}`,
    ...plan.features
  ];

  return (
    <Card
      className={`relative cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-purple-500 shadow-lg scale-105'
          : 'hover:shadow-md border-border'
      } ${plan.name === 'Pro' ? 'border-2 border-purple-300' : ''}`}
      onClick={() => onSelect(plan.id)}
    >
      {plan.name === 'Pro' && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
            🌟 Mais Popular
          </span>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
        <CardDescription className="text-2xl font-bold text-primary">
          R$ {price.toFixed(2)}{period}
        </CardDescription>
        {plan.description && (
          <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
        )}
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-3">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-foreground/80 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-6 flex justify-center">
          <div className={`w-4 h-4 rounded-full border-2 ${
            isSelected
              ? 'bg-primary/50 border-purple-500'
              : 'border-input'
          }`}>
            {isSelected && (
              <Check className="h-3 w-3 text-white" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
