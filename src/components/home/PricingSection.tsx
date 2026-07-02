
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActivePlans } from '@/hooks/usePlans';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { designColors } from '@/utils/designSystem';
import { ActivePlan } from '@/types/plans';

const PricingSection = () => {
  const navigate = useNavigate();
  const { plans, loading } = useActivePlans();
  const [showYearlyPricing, setShowYearlyPricing] = useState(false);

  // Filter out internal plans
  const publicPlans = plans.filter(
    (p) => !p.name.toLowerCase().includes('admin')
  );

  const handleSelectPlan = (planId: string) => {
    navigate(`/new-signup?plan=${planId}`);
  };

  if (loading) {
    return (
      <section className={`py-12 sm:py-20 ${designColors.responsive.containerPadding}`}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section id="planos" className={`py-12 sm:py-20 ${designColors.responsive.containerPadding} ${designColors.backgrounds.section}`}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-6 w-6 text-violet-500" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Planos
            </span>
          </div>
          <h2 className={`${designColors.responsive.pageTitle} font-fredoka text-foreground mb-4`}>
            🎯 Escolha seu Plano
          </h2>
          <p className={`${designColors.responsive.bodyText} text-muted-foreground max-w-lg mx-auto`}>
            Comece grátis e evolua conforme seus estudos. Todos os planos incluem IA de última geração!
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <Label htmlFor="pricing-toggle-home" className="text-sm font-medium">
            Mensal
          </Label>
          <Switch
            id="pricing-toggle-home"
            checked={showYearlyPricing}
            onCheckedChange={setShowYearlyPricing}
          />
          <Label htmlFor="pricing-toggle-home" className="text-sm font-medium">
            Anual
          </Label>
          {showYearlyPricing && (
            <span className="text-sm text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full">
              Economize até 20%
            </span>
          )}
        </div>

        {/* Plan Cards */}
        <div className={`grid ${designColors.responsive.gridCols3} gap-6 max-w-5xl mx-auto`}>
          {publicPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              showYearlyPrice={showYearlyPricing}
              onSelect={handleSelectPlan}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface PricingCardProps {
  plan: ActivePlan;
  showYearlyPrice: boolean;
  onSelect: (planId: string) => void;
}

const PricingCard = ({ plan, showYearlyPrice, onSelect }: PricingCardProps) => {
  const price = showYearlyPrice ? plan.price_brl_yearly : plan.price_brl;
  const period = showYearlyPrice ? '/ano' : '/mês';
  const isFree = price === 0;
  const isPopular = plan.name === 'Pro';

  const features = [
    `${plan.uploads_limit} uploads por mês`,
    `${plan.summaries_limit} resumos por mês`,
    `${plan.flashcards_limit} flashcards por mês`,
    `${plan.quizzes_limit} quizzes por mês`,
    ...plan.features,
  ];

  return (
    <Card
      className={`relative transition-all duration-300 hover:shadow-xl ${
        isPopular
          ? 'border-2 border-violet-400 shadow-lg scale-[1.03]'
          : 'border-border hover:scale-[1.01]'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
            🌟 Mais Popular
          </span>
        </div>
      )}

      <CardHeader className="text-center pb-4 pt-6">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription className="text-2xl font-bold text-primary">
          {isFree ? 'Grátis' : `R$ ${price.toFixed(2)}${period}`}
        </CardDescription>
        {plan.description && (
          <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
        )}
      </CardHeader>

      <CardContent>
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-3">
              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={() => onSelect(plan.id)}
          className={`w-full rounded-xl ${
            isPopular
              ? designColors.buttons.primary
              : isFree
              ? designColors.buttons.secondary
              : designColors.buttons.outline
          }`}
          variant={isPopular || isFree ? 'default' : 'outline'}
        >
          {isFree ? 'Começar Grátis 🚀' : 'Escolher este Plano'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PricingSection;
