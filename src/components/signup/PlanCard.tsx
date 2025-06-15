
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { PlanType } from '@/types/plans';

interface PlanCardProps {
  plan: {
    id: PlanType;
    name: string;
    price: string;
    features: string[];
    popular: boolean;
  };
  selectedPlan: PlanType;
  onSelectPlan: (planId: PlanType) => void;
}

const PlanCard = ({ plan, selectedPlan, onSelectPlan }: PlanCardProps) => {
  return (
    <Card
      className={`relative cursor-pointer transition-all duration-300 ${
        selectedPlan === plan.id
          ? 'ring-2 ring-purple-500 shadow-lg scale-105'
          : 'hover:shadow-md border-gray-200'
      } ${plan.popular ? 'border-2 border-purple-300' : ''}`}
      onClick={() => onSelectPlan(plan.id)}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            🌟 Mais Popular
          </span>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl text-gray-800">{plan.name}</CardTitle>
        <CardDescription className="text-2xl font-bold text-purple-600">
          {plan.price}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-3">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-gray-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-6 flex justify-center">
          <div className={`w-4 h-4 rounded-full border-2 ${
            selectedPlan === plan.id
              ? 'bg-purple-500 border-purple-500'
              : 'border-gray-300'
          }`}>
            {selectedPlan === plan.id && (
              <Check className="h-3 w-3 text-white" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
