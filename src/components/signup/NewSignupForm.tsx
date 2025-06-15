
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSignupForm } from '@/hooks/useSignupForm';
import FormStepIndicator from './FormStepIndicator';
import StudentInfoSection from './StudentInfoSection';
import GuardianInfoSection from './GuardianInfoSection';
import PlanSelection from './PlanSelection';

const NewSignupForm = () => {
  const navigate = useNavigate();
  const {
    formData,
    currentStep,
    loading,
    updateProfile,
    updateGuardian,
    updateBasicInfo,
    nextStep,
    prevStep,
    submitForm,
    totalSteps
  } = useSignupForm();

  const handleSubmit = async () => {
    const success = await submitForm();
    if (success) {
      navigate('/login');
    }
  };

  const isLastStep = currentStep === totalSteps;
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.email && formData.password && formData.confirmPassword && 
               formData.username && formData.password === formData.confirmPassword && 
               formData.password.length >= 6 && formData.username.trim().length >= 3;
      case 2:
        return formData.profile.full_name && formData.profile.date_of_birth;
      case 3:
        if (formData.profile.is_minor) {
          return formData.guardian?.full_name && formData.guardian?.email && 
                 formData.guardian?.phone && formData.guardian?.relation_to_student;
        }
        return true;
      case 4:
        return formData.selectedPlanId;
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    if (currentStep <= 2) {
      return (
        <StudentInfoSection
          profile={formData.profile}
          email={formData.email}
          password={formData.password}
          confirmPassword={formData.confirmPassword}
          username={formData.username}
          onProfileChange={updateProfile}
          onBasicInfoChange={updateBasicInfo}
          step={currentStep}
        />
      );
    }
    
    if (currentStep === 3 && formData.profile.is_minor) {
      return (
        <GuardianInfoSection
          guardian={formData.guardian}
          onGuardianChange={updateGuardian}
        />
      );
    }
    
    if ((currentStep === 3 && !formData.profile.is_minor) || (currentStep === 4 && formData.profile.is_minor)) {
      return (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 mb-1">📋 Escolha seu Plano</h2>
            <p className="text-sm text-gray-600">Selecione o plano que melhor se adapta aos seus estudos</p>
          </div>
          <PlanSelection
            selectedPlanId={formData.selectedPlanId}
            onSelectPlan={(planId) => updateBasicInfo({ selectedPlanId: planId })}
          />
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-4 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Bem-vindo ao EstudoFácil AI! 🚀
          </h1>
          <p className="text-base text-gray-600">
            Crie sua conta e transforme seus estudos com inteligência artificial
          </p>
        </div>

        <FormStepIndicator 
          currentStep={currentStep} 
          totalSteps={totalSteps}
          isMinor={formData.profile.is_minor}
        />

        <Card className="shadow-lg border border-purple-200 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-800">Criar Conta</CardTitle>
            <CardDescription className="text-sm">
              Preencha os dados para começar sua jornada de estudos
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            {renderCurrentStep()}
            
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="min-w-[100px] text-sm"
              >
                ← Voltar
              </Button>
              
              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || loading}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white min-w-[120px] text-sm"
                >
                  {loading ? 'Criando...' : 'Criar Conta 🎉'}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white min-w-[100px] text-sm"
                >
                  Continuar →
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 hover:text-purple-700 font-medium underline"
            >
              Fazer login aqui
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewSignupForm;
