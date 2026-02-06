
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, GraduationCap, Zap, Loader2, ArrowRight } from 'lucide-react';
import { PlanType } from '@/types/plans';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { usePlansData } from '@/hooks/usePlansData';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanType;
  actionType: string;
}

const UpgradeModal = ({ isOpen, onClose, currentPlan, actionType }: UpgradeModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { getNextPlan, loading: plansLoading } = usePlansData();
  const getPlanIcon = (plan: PlanType) => {
    switch (plan) {
      case 'pro':
        return <Crown className="h-5 w-5" />;
      case 'edu':
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getRecommendedPlan = () => {
    const nextPlan = getNextPlan(currentPlan);
    
    if (!nextPlan) {
      // Fallback to hardcoded data if no plans found
      if (currentPlan === 'free') {
        return {
          id: 'fallback-pro',
          name: 'pro',
          displayName: 'PRO',
          price: 'R$ 29,90/mês',
          benefits: ['100 uploads por mês', '100 flashcards por mês', '100 quizzes por mês', 'Suporte prioritário'],
          color: 'from-blue-500 to-blue-700',
        };
      }
      return {
        id: 'fallback-edu',
        name: 'edu',
        displayName: 'EDU', 
        price: 'R$ 49,90/mês',
        benefits: ['Uploads ilimitados', 'Flashcards ilimitados', 'Quizzes ilimitados', 'Recursos educacionais especiais'],
        color: 'from-green-500 to-green-700',
      };
    }

    return {
      id: nextPlan.id,
      name: nextPlan.name,
      displayName: nextPlan.name.toUpperCase(),
      price: `R$ ${nextPlan.price_brl.toFixed(2).replace('.', ',')}/mês`,
      benefits: nextPlan.features || [
        `${nextPlan.uploads_limit === -1 ? 'Uploads ilimitados' : `${nextPlan.uploads_limit} uploads por mês`}`,
        `${nextPlan.flashcards_limit === -1 ? 'Flashcards ilimitados' : `${nextPlan.flashcards_limit} flashcards por mês`}`,
        `${nextPlan.quizzes_limit === -1 ? 'Quizzes ilimitados' : `${nextPlan.quizzes_limit} quizzes por mês`}`,
        'Suporte prioritário'
      ],
      color: nextPlan.name.toLowerCase() === 'pro' ? 'from-blue-500 to-blue-700' : 'from-green-500 to-green-700',
    };
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { planId: recommendedPlan.id }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        onClose();
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Não foi possível iniciar o processo de upgrade. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const recommendedPlan = getRecommendedPlan();

  if (plansLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Limite do plano {currentPlan.toUpperCase()} atingido
          </DialogTitle>
          <DialogDescription className="text-center">
            Você atingiu o limite de {actionType} do seu plano atual.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className={`p-6 rounded-lg bg-gradient-to-r ${recommendedPlan.color} text-white text-center`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {getPlanIcon(recommendedPlan.name as PlanType)}
              <h3 className="text-xl font-bold">Plano {recommendedPlan.displayName}</h3>
            </div>
            <p className="text-2xl font-bold mb-1">{recommendedPlan.price}</p>
            <p className="text-sm opacity-90">Cancele quando quiser</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-gray-700">O que você ganha:</h4>
            <ul className="space-y-1">
              {recommendedPlan.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Continuar no plano atual
              </Button>
              <Button 
                className={`flex-1 bg-gradient-to-r ${recommendedPlan.color} hover:opacity-90`}
                onClick={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  `Assinar plano ${recommendedPlan.displayName}`
                )}
              </Button>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => {
                onClose();
                navigate('/choose-plan');
              }}
              className="text-muted-foreground hover:text-violet-600"
            >
              Ver todos os planos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
