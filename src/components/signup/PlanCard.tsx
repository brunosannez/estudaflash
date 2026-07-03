
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

  // Capacidades derivadas dos créditos (resumo 8cr, quiz 8cr, flashcards
  // 3cr) — os limites legados (uploads_limit etc.) estão em 999999
  const credits = plan.credits_per_month ?? 0;
  const features = credits > 0
    ? [
        `${credits} créditos por mês`,
        `Até ${Math.floor(credits / 8)} resumos com IA`,
        `Até ${Math.floor(credits / 8)} quizzes estilo ENEM`,
        `Até ${Math.floor(credits / 3)} gerações de flashcards`,
        `Mapas mentais e leitura de fotos`,
        ...(plan.features || []),
      ]
    : [...(plan.features || [])];

  return (
    <Card
      className={`relative cursor-pointer rounded-2xl transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-primary shadow-lg scale-[1.02]'
          : 'hover:shadow-md border-border'
      } ${plan.name === 'Pro' ? 'border-2 border-primary/20' : ''}`}
      onClick={() => onSelect(plan.id)}
    >
      {plan.name === 'Pro' && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold shadow-md">
            🌟 Mais Popular
          </span>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
        <CardDescription className="text-2xl font-extrabold text-primary">
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
              <span className="w-4 h-4 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Check className="h-2.5 w-2.5 text-accent-foreground" strokeWidth={3.5} />
              </span>
              <span className="text-foreground/80 text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-center">
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            isSelected
              ? 'bg-primary border-primary'
              : 'border-input'
          }`}>
            {isSelected && (
              <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3.5} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
