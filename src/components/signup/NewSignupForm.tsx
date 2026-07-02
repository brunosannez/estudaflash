
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSignupForm } from '@/hooks/useSignupForm';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import FormStepIndicator from './FormStepIndicator';
import StudentInfoSection from './StudentInfoSection';
import GuardianInfoSection from './GuardianInfoSection';
import PlanSelection from './PlanSelection';
import GoogleIcon from '@/components/common/GoogleIcon';
import { Zap } from 'lucide-react';

const NewSignupForm = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [googleLoading, setGoogleLoading] = useState(false);
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
        return !!formData.selectedPlanId;
      case 4:
        return formData.selectedPlanId;
      default:
        return false;
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('❌ Google signup error:', error);
      toast({
        title: "Erro no cadastro com Google",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const renderCurrentStep = () => {
    if (currentStep <= 2) {
      return (
        <>
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
          {currentStep === 1 && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-input" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou cadastre-se com</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full border-input hover:bg-muted/50 font-medium"
                onClick={handleGoogleSignup}
                disabled={googleLoading}
              >
                <GoogleIcon className="h-5 w-5 mr-2" />
                {googleLoading ? 'Conectando...' : 'Cadastrar com Google'}
              </Button>
            </>
          )}
        </>
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
            <h2 className="text-xl font-bold text-foreground mb-1">📋 Escolha seu Plano</h2>
            <p className="text-sm text-muted-foreground">Selecione o plano que melhor se adapta aos seus estudos</p>
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
    <div className="min-h-screen bg-muted/50 py-4 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <div className="absolute inset-0 bg-primary/10 animate-pulse rounded-2xl"></div>
                <Zap className="text-2xl text-white relative z-10 animate-bounce" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Bem-vindo ao Estuda Flash! 
            </h1>
            <span className="text-3xl animate-bounce">⚡</span>
          </div>
          <p className="text-base text-muted-foreground">
            Crie sua conta e transforme seus estudos com velocidade e inteligência artificial
          </p>
        </div>

        <FormStepIndicator 
          currentStep={currentStep} 
          totalSteps={totalSteps}
          isMinor={formData.profile.is_minor}
        />

        <Card className="shadow-lg border border-primary/20 bg-background/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-foreground">Criar Conta</CardTitle>
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
                  className="bg-primary hover:opacity-90 text-white min-w-[120px] text-sm"
                >
                  {loading ? 'Criando...' : 'Criar Conta ⚡'}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-primary hover:opacity-90 text-white min-w-[100px] text-sm"
                >
                  Continuar →
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:text-primary font-medium underline"
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
