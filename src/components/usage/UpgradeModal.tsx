
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, GraduationCap, Zap } from 'lucide-react';
import { PlanType } from '@/types/plans';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanType;
  actionType: string;
}

const UpgradeModal = ({ isOpen, onClose, currentPlan, actionType }: UpgradeModalProps) => {
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
    if (currentPlan === 'free') {
      return {
        name: 'pro',
        displayName: 'PRO',
        price: 'R$ 29,90/mês',
        benefits: ['100 uploads por mês', '100 flashcards por mês', '100 quizzes por mês', 'Suporte prioritário'],
        color: 'from-blue-500 to-blue-700',
      };
    }
    return {
      name: 'edu',
      displayName: 'EDU',
      price: 'R$ 49,90/mês',
      benefits: ['Uploads ilimitados', 'Flashcards ilimitados', 'Quizzes ilimitados', 'Recursos educacionais especiais'],
      color: 'from-green-500 to-green-700',
    };
  };

  const recommendedPlan = getRecommendedPlan();

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

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Continuar no plano atual
            </Button>
            <Button 
              className={`flex-1 bg-gradient-to-r ${recommendedPlan.color} hover:opacity-90`}
              onClick={() => {
                // TODO: Implementar integração com sistema de pagamento
                console.log(`Upgrade para plano ${recommendedPlan.name}`);
                onClose();
              }}
            >
              Assinar plano {recommendedPlan.displayName}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
