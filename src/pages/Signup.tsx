
import { useState } from 'react';
import { PlanType } from '@/types/plans';
import SignupBackground from '@/components/signup/SignupBackground';
import SignupHeader from '@/components/signup/SignupHeader';
import PlanSelection from '@/components/signup/PlanSelection';
import SignupForm from '@/components/signup/SignupForm';

const Signup = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('free');

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
              selectedPlan={selectedPlan} 
              onSelectPlan={setSelectedPlan} 
            />
            <SignupForm selectedPlan={selectedPlan} />
          </div>
        </div>
      </div>
    </SignupBackground>
  );
};

export default Signup;
