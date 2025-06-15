
import { useState, useEffect } from 'react';
import SignupBackground from '@/components/signup/SignupBackground';
import SignupHeader from '@/components/signup/SignupHeader';
import PlanSelection from '@/components/signup/PlanSelection';
import SignupForm from '@/components/signup/SignupForm';
import { useActivePlans } from '@/hooks/usePlans';

const Signup = () => {
  const { plans, loading } = useActivePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  // Set Free plan as default when plans are loaded
  useEffect(() => {
    if (plans.length > 0) {
      const freePlan = plans.find(plan => plan.name.toLowerCase() === 'free');
      if (freePlan && !selectedPlanId) {
        console.log('Setting default Free plan:', freePlan.id);
        setSelectedPlanId(freePlan.id);
      } else if (!selectedPlanId) {
        // If no free plan, select the first available plan
        console.log('No Free plan found, selecting first plan:', plans[0].id);
        setSelectedPlanId(plans[0].id);
      }
    }
  }, [plans, selectedPlanId]);

  if (loading) {
    return (
      <SignupBackground>
        <div className="relative z-10 container mx-auto px-4 py-8">
          <SignupHeader />
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2">Carregando planos...</span>
          </div>
        </div>
      </SignupBackground>
    );
  }

  // Show error if no plans are available
  if (plans.length === 0) {
    return (
      <SignupBackground>
        <div className="relative z-10 container mx-auto px-4 py-8">
          <SignupHeader />
          <div className="flex items-center justify-center py-12">
            <div className="bg-red-50 p-6 rounded-lg border border-red-200 max-w-md">
              <h3 className="text-red-800 font-medium mb-2">Erro de Configuração</h3>
              <p className="text-red-600 text-sm">
                Nenhum plano está disponível no momento. Por favor, tente novamente mais tarde.
              </p>
            </div>
          </div>
        </div>
      </SignupBackground>
    );
  }

  return (
    <SignupBackground>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <SignupHeader />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Escolha seu plano e comece a estudar! 🚀
            </h2>
            <p className="text-lg text-gray-600">
              Crie sua conta e transforme seus estudos com IA
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <PlanSelection 
              selectedPlanId={selectedPlanId} 
              onSelectPlan={setSelectedPlanId} 
            />
            <SignupForm selectedPlanId={selectedPlanId} />
          </div>
        </div>
      </div>
    </SignupBackground>
  );
};

export default Signup;
