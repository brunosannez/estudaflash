
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { usePlans } from '@/hooks/usePlans';
import PlanCard from '@/components/plans/PlanCard';

interface PlanSelectionProps {
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;
}

const PlanSelection = ({ selectedPlanId, onSelectPlan }: PlanSelectionProps) => {
  const { plans, loading } = usePlans();
  const [showYearlyPricing, setShowYearlyPricing] = useState(false);

  if (loading) {
    return (
      <div className="lg:col-span-2">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Carregando planos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Escolha seu plano</h3>
        
        <div className="flex items-center justify-center gap-4 mb-6">
          <Label htmlFor="pricing-toggle" className="text-sm">
            Mensal
          </Label>
          <Switch
            id="pricing-toggle"
            checked={showYearlyPricing}
            onCheckedChange={setShowYearlyPricing}
          />
          <Label htmlFor="pricing-toggle" className="text-sm">
            Anual
          </Label>
          {showYearlyPricing && (
            <span className="text-sm text-green-600 font-medium">
              (Economize até 10%)
            </span>
          )}
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlanId === plan.id}
            onSelect={onSelectPlan}
            showYearlyPrice={showYearlyPricing}
          />
        ))}
      </div>
    </div>
  );
};

export default PlanSelection;
