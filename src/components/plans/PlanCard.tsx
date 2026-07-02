
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { Plan } from '@/types/plans';

interface PlanCardProps {
  plan: Plan;
  isSelected?: boolean;
  onSelect?: (planId: string) => void;
  showYearlyPrice?: boolean;
  isCurrentPlan?: boolean;
}

const PlanCard = ({ 
  plan, 
  isSelected = false, 
  onSelect, 
  showYearlyPrice = false,
  isCurrentPlan = false 
}: PlanCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getPlanIcon = () => {
    switch (plan.name.toLowerCase()) {
      case 'free':
        return <Zap className="h-5 w-5 text-muted-foreground" />;
      case 'pro':
        return <Star className="h-5 w-5 text-blue-500" />;
      case 'pro max':
        return <Crown className="h-5 w-5 text-purple-500" />;
      default:
        return <Zap className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPlanColor = () => {
    switch (plan.name.toLowerCase()) {
      case 'free':
        return 'border-border';
      case 'pro':
        return 'border-blue-300';
      case 'pro max':
        return 'border-purple-300';
      default:
        return 'border-border';
    }
  };

  const isPopular = plan.name.toLowerCase() === 'pro';
  const currentPrice = showYearlyPrice ? plan.price_brl_yearly : plan.price_brl;
  const priceLabel = showYearlyPrice ? '/ano' : '/mês';

  return (
    <Card className={`relative transition-all duration-300 ${
      isSelected 
        ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
        : `hover:shadow-md ${getPlanColor()}`
    } ${isPopular ? 'border-2 border-blue-300' : ''}`}>
      
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary/50 text-white px-3 py-1">
            🌟 Mais Popular
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            Plano Atual
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          {getPlanIcon()}
          <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
        </div>
        
        <div className="space-y-1">
          <CardDescription className="text-3xl font-bold text-foreground">
            {formatPrice(currentPrice)}
            <span className="text-sm font-normal text-muted-foreground">{priceLabel}</span>
          </CardDescription>
          
          {showYearlyPrice && plan.price_brl > 0 && (
            <div className="text-sm text-muted-foreground">
              {formatPrice(plan.price_brl * 12)} por ano (sem desconto)
            </div>
          )}
        </div>

        {plan.description && (
          <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">{plan.uploads_limit} uploads por mês</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">{plan.summaries_limit} resumos por mês</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">{plan.flashcards_limit} flashcards por mês</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">{plan.quizzes_limit} quizzes por mês</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">Quiz com {plan.quiz_model}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">Resumos com {plan.summary_model}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">Flashcards com {plan.flashcard_model}</span>
          </div>

          {plan.features?.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        
        {onSelect && !isCurrentPlan && (
          <Button
            onClick={() => onSelect(plan.id)}
            className={`w-full ${
              isSelected 
                ? 'bg-primary hover:bg-primary/90' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isSelected ? 'Selecionado' : 'Selecionar Plano'}
          </Button>
        )}
        
        {isCurrentPlan && (
          <Button disabled className="w-full">
            Plano Atual
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanCard;
