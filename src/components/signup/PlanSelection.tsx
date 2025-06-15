
import { PlanType } from '@/types/plans';
import PlanCard from './PlanCard';

interface PlanSelectionProps {
  selectedPlan: PlanType;
  onSelectPlan: (planId: PlanType) => void;
}

const PlanSelection = ({ selectedPlan, onSelectPlan }: PlanSelectionProps) => {
  const plans = [
    {
      id: 'free' as PlanType,
      name: 'Plano Gratuito',
      price: 'R$ 0/mês',
      features: [
        '10 uploads por mês',
        '10 quizzes',
        '10 flashcards',
        'Modelos de IA básicos',
        'Suporte por email'
      ],
      popular: false
    },
    {
      id: 'pro' as PlanType,
      name: 'Plano Pro',
      price: 'R$ 29,90/mês',
      features: [
        '100 uploads por mês',
        'Quizzes com GPT-4',
        'Flashcards com modo de memória avançado',
        'Acompanhamento de progresso e gamificação',
        'Acesso antecipado a novas ferramentas',
        'Suporte prioritário'
      ],
      popular: true
    }
  ];

  return (
    <div className="lg:col-span-2">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Escolha seu plano</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selectedPlan={selectedPlan}
            onSelectPlan={onSelectPlan}
          />
        ))}
      </div>
    </div>
  );
};

export default PlanSelection;
