import { useState } from 'react';
import { SignupFormData, UserProfile, Guardian } from '@/types/signup';
import { supabase } from '@/integrations/supabase/client';
import { isMinor } from '@/utils/signupValidation';
import { useToast } from '@/hooks/use-toast';

export const useSignupForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    profile: {
      full_name: '',
      date_of_birth: '',
      school_year: '',
      is_minor: false
    },
    guardian: undefined,
    selectedPlanId: ''
  });

  const updateProfile = (profile: Partial<UserProfile>) => {
    const updatedProfile = { ...formData.profile, ...profile };
    
    // Auto-detect if user is minor
    if (updatedProfile.date_of_birth) {
      updatedProfile.is_minor = isMinor(updatedProfile.date_of_birth);
    }
    
    setFormData(prev => ({
      ...prev,
      profile: updatedProfile,
      // Clear guardian data if user becomes major
      guardian: updatedProfile.is_minor ? prev.guardian : undefined
    }));
  };

  const updateGuardian = (guardian: Partial<Guardian>) => {
    setFormData(prev => ({
      ...prev,
      guardian: { ...prev.guardian, ...guardian } as Guardian
    }));
  };

  const updateBasicInfo = (data: Partial<Pick<SignupFormData, 'email' | 'password' | 'confirmPassword' | 'selectedPlanId'>>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.email && formData.password && formData.confirmPassword && 
                 formData.password === formData.confirmPassword && formData.password.length >= 6);
      case 2:
        return !!(formData.profile.full_name && formData.profile.date_of_birth);
      case 3:
        if (formData.profile.is_minor) {
          return !!(formData.guardian?.full_name && formData.guardian?.email && 
                   formData.guardian?.phone && formData.guardian?.relation_to_student);
        }
        return true;
      case 4:
        return !!formData.selectedPlanId;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const submitForm = async (): Promise<boolean> => {
    setLoading(true);
    
    const userMetaData = {
      full_name: formData.profile.full_name,
      date_of_birth: formData.profile.date_of_birth,
      school_year: formData.profile.school_year || null,
      is_minor: formData.profile.is_minor,
      guardian: formData.profile.is_minor ? formData.guardian : undefined,
      plan_id: formData.selectedPlanId
    };

    try {
      console.log('Attempting signup with metadata:', userMetaData);
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: userMetaData
        }
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
        console.error('Signup error:', error);
        return false;
      }

      if (!data.user) {
        toast({
          title: "Erro no cadastro",
          description: "Não foi possível criar a conta. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }
      
      console.log('User creation request sent. Awaiting confirmation/login.');
      
      toast({
        title: "Conta criada com sucesso! 🎉",
        description: data.user.email_confirmed_at 
          ? "Bem-vindo ao EstudoFácil AI!" 
          : "Verifique seu email para confirmar sua conta.",
      });

      return true;

    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "Erro inesperado",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    currentStep,
    loading,
    updateProfile,
    updateGuardian,
    updateBasicInfo,
    nextStep,
    prevStep,
    validateStep,
    submitForm,
    totalSteps: formData.profile.is_minor ? 4 : 3
  };
};
