
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  username?: string;
  date_of_birth: string;
  school_year?: string;
  is_minor: boolean;
  created_at: string;
  updated_at: string;
}

interface GuardianInfo {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  cpf?: string;
  relation_to_student: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guardian, setGuardian] = useState<GuardianInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setGuardian(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Se for menor de idade, buscar dados do responsável
      if (profileData?.is_minor) {
        const { data: guardianData, error: guardianError } = await supabase
          .from('guardians')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        if (guardianError) {
          console.error('Erro ao buscar dados do responsável:', guardianError);
        } else {
          setGuardian(guardianData);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (!user) return 'Usuário';
    
    // Prioridade: username > primeiro nome > email
    if (profile?.username) {
      return profile.username;
    }
    
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0];
    }
    
    return user.email?.split('@')[0] || 'Usuário';
  };

  const getFullName = () => {
    return profile?.full_name || user?.email?.split('@')[0] || 'Usuário';
  };

  const getSchoolYear = () => {
    return profile?.school_year || 'Não informado';
  };

  const getDateOfBirth = () => {
    if (!profile?.date_of_birth) return 'Não informado';
    return new Date(profile.date_of_birth).toLocaleDateString('pt-BR');
  };

  const getAge = () => {
    if (!profile?.date_of_birth) return null;
    const today = new Date();
    const birthDate = new Date(profile.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return {
    profile,
    guardian,
    loading,
    getDisplayName,
    getFullName,
    getSchoolYear,
    getDateOfBirth,
    getAge,
    refetch: fetchProfile
  };
};
