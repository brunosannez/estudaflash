
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useActivePlans } from '@/hooks/usePlans';
import { useUsageData } from '@/hooks/useUsageData';
import { PlansService } from '@/services/plansService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { designColors } from '@/utils/designSystem';
import { ActivePlan } from '@/types/plans';

const ChoosePlan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plans, loading: plansLoading } = useActivePlans();
  const { usageData, loading: usageLoading } = useUsageData();
  const { toast } = useToast();

  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [showYearlyPricing, setShowYearlyPricing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [canceling, setCanceling] = useState(false);

  // Filter out internal plans like "Admin Unlimited"
  const publicPlans = plans.filter(
    (p) => !p.name.toLowerCase().includes('admin')
  );
  
  // Get current user's plan name (lowercase for comparison)
  const currentPlanName = usageData?.plan_name?.toLowerCase() || usageData?.plano?.toLowerCase() || 'free';

  const handleConfirm = async () => {
    if (!selectedPlanId) {
      toast({
        title: 'Selecione um plano',
        description: 'Escolha um plano para continuar.',
        variant: 'destructive',
      });
      return;
    }

    const selectedPlan = publicPlans.find((p) => p.id === selectedPlanId);

    setSubmitting(true);
    try {
      // Plano pago passa obrigatoriamente pelo checkout Stripe;
      // ativação direta só para plano gratuito
      if (selectedPlan && selectedPlan.price_brl > 0) {
        const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
          body: { planId: selectedPlanId },
        });

        if (error || !data?.url) {
          throw new Error(data?.error || 'Não foi possível iniciar o pagamento.');
        }

        window.location.href = data.url;
        return;
      }

      await PlansService.selectPlan(selectedPlanId);
      toast({
        title: 'Plano ativado! 🎉',
        description: 'Seu plano foi atualizado com sucesso.',
      });
      navigate('/');
    } catch (error: any) {
      console.error('Erro ao selecionar plano:', error);
      toast({
        title: 'Erro ao selecionar plano',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Cancelar sua assinatura? Você mantém o acesso até o fim do período já pago.')) {
      return;
    }

    setCanceling(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {},
        headers: {
          Authorization: `Bearer ${sessionData?.session?.access_token}`,
        },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'Não foi possível cancelar. Entre em contato com o suporte.');
      }

      toast({
        title: 'Assinatura cancelada',
        description: data.message,
      });
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error);
      toast({
        title: 'Erro ao cancelar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCanceling(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  if (plansLoading || usageLoading) {
    return (
      <div className={`min-h-screen ${designColors.backgrounds.main} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${designColors.backgrounds.main} py-8 px-4`}>
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className={`${designColors.responsive.pageTitle} text-foreground`}>
              {currentPlanName !== 'free' ? 'Gerenciar Plano' : 'Escolha seu Plano'}
            </h1>
          </div>
          <p className={`${designColors.responsive.bodyText} text-muted-foreground max-w-lg mx-auto`}>
            {currentPlanName !== 'free' 
              ? `Você está no plano ${currentPlanName.toUpperCase()}. Veja outras opções abaixo.`
              : 'Selecione o plano ideal para turbinar seus estudos com IA. Você pode mudar a qualquer momento!'
            }
          </p>
        </div>

        {/* Toggle Mensal/Anual */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Label htmlFor="pricing-toggle-choose" className="text-sm font-medium">
            Mensal
          </Label>
          <Switch
            id="pricing-toggle-choose"
            checked={showYearlyPricing}
            onCheckedChange={setShowYearlyPricing}
          />
          <Label htmlFor="pricing-toggle-choose" className="text-sm font-medium">
            Anual
          </Label>
          {showYearlyPricing && (
            <span className="text-sm text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full">
              Economize até 20%
            </span>
          )}
        </div>

        {/* Plan Cards */}
        <div className={`grid ${designColors.responsive.gridCols3} gap-6 mb-8`}>
          {publicPlans.map((plan) => (
            <PlanCardChoose
              key={plan.id}
              plan={plan}
              isSelected={selectedPlanId === plan.id}
              isCurrentPlan={plan.name.toLowerCase() === currentPlanName}
              onSelect={setSelectedPlanId}
              showYearlyPrice={showYearlyPricing}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={handleConfirm}
            disabled={!selectedPlanId || submitting}
            className={`${designColors.buttons.primary} min-w-[200px] text-base rounded-xl`}
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Ativando...
              </>
            ) : (
              <>
                Confirmar Plano
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Continuar com o plano Free →
          </Button>
        </div>

        {/* Gerenciar assinatura ativa */}
        {currentPlanName !== 'free' && (
          <div className="mt-12 text-center border-t border-border pt-8">
            <h3 className="text-sm font-semibold text-foreground mb-1">Minha Assinatura</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Precisa pausar? Você pode cancelar a renovação e manter o acesso até o fim do período já pago.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelSubscription}
              disabled={canceling}
              className="text-destructive hover:text-destructive"
            >
              {canceling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cancelando...
                </>
              ) : (
                'Cancelar assinatura'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Internal plan card component for the choose-plan page
interface PlanCardChooseProps {
  plan: ActivePlan;
  isSelected: boolean;
  isCurrentPlan: boolean;
  onSelect: (planId: string) => void;
  showYearlyPrice: boolean;
}

const PlanCardChoose = ({ plan, isSelected, isCurrentPlan, onSelect, showYearlyPrice }: PlanCardChooseProps) => {
  const price = showYearlyPrice ? plan.price_brl_yearly : plan.price_brl;
  const period = showYearlyPrice ? '/ano' : '/mês';
  const isFree = price === 0;
  const isPopular = plan.name === 'Pro';

  // Custos por ação: resumo 8, quiz 8, flashcards 3, mapa 2, OCR 1/imagem
  const credits = plan.credits_per_month ?? 0;
  const features = credits > 0
    ? [
        `${credits} créditos por mês`,
        `≈ ${Math.floor(credits / 31)} sessões completas de estudo`,
        `Até ${Math.floor(credits / 8)} resumos com IA`,
        `Até ${Math.floor(credits / 8)} quizzes estilo ENEM`,
        `Flashcards e mapas mentais ilimitados pelos créditos`,
        ...(plan.features || []),
      ]
    : [...(plan.features || [])];

  return (
    <Card
      className={`relative cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-primary shadow-xl scale-[1.03]'
          : 'hover:shadow-lg hover:scale-[1.01] border-border'
      } ${isPopular ? 'border-2 border-primary/20' : ''} ${isCurrentPlan ? 'bg-primary/5/50' : ''}`}
      onClick={() => onSelect(plan.id)}
    >
      {isCurrentPlan && (
        <div className="absolute -top-3 -left-3 z-10">
          <Badge className="bg-emerald-500 text-white shadow-md">
            ✓ Plano Atual
          </Badge>
        </div>
      )}
      
      {isPopular && !isCurrentPlan && (
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
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-3">
              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-center">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-primary/50 border-primary'
                : 'border-muted-foreground/30'
            }`}
          >
            {isSelected && <Check className="h-3 w-3 text-white" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChoosePlan;
