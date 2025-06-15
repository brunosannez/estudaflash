
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
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (authError) {
        toast({
          title: "Erro no cadastro",
          description: authError.message,
          variant: "destructive",
        });
        return false;
      }

      if (!authData.user) {
        toast({
          title: "Erro no cadastro",
          description: "Não foi possível criar a conta.",
          variant: "destructive",
        });
        return false;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          full_name: formData.profile.full_name,
          date_of_birth: formData.profile.date_of_birth,
          school_year: formData.profile.school_year || null,
          is_minor: formData.profile.is_minor
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // Create guardian record if user is minor
      if (formData.profile.is_minor && formData.guardian) {
        const { error: guardianError } = await supabase
          .from('guardians')
          .insert({
            user_id: authData.user.id,
            full_name: formData.guardian.full_name,
            email: formData.guardian.email,
            phone: formData.guardian.phone,
            cpf: formData.guardian.cpf || null,
            relation_to_student: formData.guardian.relation_to_student
          });

        if (guardianError) {
          console.error('Error creating guardian:', guardianError);
        }
      }

      // Create usage record
      const { error: usageError } = await supabase
        .from('uso_usuarios')
        .insert({
          user_id: authData.user.id,
          plan_id: formData.selectedPlanId,
          is_admin: false,
          uploads_realizados: 0,
          flashcards_gerados: 0,
          quizzes_realizados: 0,
        });

      if (usageError) {
        console.error('Error creating usage record:', usageError);
      }

      toast({
        title: "Conta criada com sucesso! 🎉",
        description: "Bem-vindo ao EstudoFácil AI!",
      });

      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes.",
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
