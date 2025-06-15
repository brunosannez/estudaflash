
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
    username: '',
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

  const updateBasicInfo = (data: Partial<Pick<SignupFormData, 'email' | 'password' | 'confirmPassword' | 'selectedPlanId' | 'username'>>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    if (!username.trim()) return false;
    
    try {
      const { data, error } = await supabase.rpc('check_username_available', {
        username_to_check: username.trim()
      });
      
      if (error) {
        console.error('Error checking username:', error);
        return false;
      }
      
      return data;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.email && formData.password && formData.confirmPassword && 
                 formData.username && formData.password === formData.confirmPassword && 
                 formData.password.length >= 6 && formData.username.trim().length >= 3);
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

  const nextStep = async () => {
    if (currentStep === 1) {
      // Validar username no primeiro passo
      const isUsernameAvailable = await checkUsernameAvailability(formData.username);
      if (!isUsernameAvailable) {
        toast({
          title: "Username não disponível",
          description: "Este nome de usuário já está em uso. Escolha outro.",
          variant: "destructive",
        });
        return;
      }
    }

    if (validateStep(currentStep)) {
      // Para menores de idade, garantir que passe pelo passo do responsável
      if (currentStep === 2 && formData.profile.is_minor) {
        setCurrentStep(3); // Força ir para o passo do responsável
      } else if (currentStep === 2 && !formData.profile.is_minor) {
        setCurrentStep(3); // Para maiores, vai direto para seleção de plano
      } else {
        setCurrentStep(prev => prev + 1);
      }
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
    
    // Validação final para menores de idade
    if (formData.profile.is_minor && !formData.guardian) {
      toast({
        title: "Dados do responsável obrigatórios",
        description: "Como você é menor de idade, é necessário preencher os dados do responsável.",
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
    
    const userMetaData = {
      full_name: formData.profile.full_name,
      date_of_birth: formData.profile.date_of_birth,
      school_year: formData.profile.school_year || null,
      is_minor: formData.profile.is_minor,
      username: formData.username.trim(),
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
    checkUsernameAvailability,
    totalSteps: formData.profile.is_minor ? 4 : 3
  };
};
