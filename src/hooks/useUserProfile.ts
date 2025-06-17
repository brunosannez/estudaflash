
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  date_of_birth: string;
  school_year?: string;
  is_minor: boolean;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar perfil:', error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const getDisplayName = (): string => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0]; // Primeiro nome
    }
    
    if (profile?.username) {
      return profile.username;
    }
    
    if (user?.email) {
      return user.email.split('@')[0]; // Parte antes do @
    }
    
    return 'Usuário';
  };

  const getFullName = (): string => {
    return profile?.full_name || user?.email?.split('@')[0] || 'Usuário';
  };

  return {
    profile,
    loading,
    getDisplayName,
    getFullName,
  };
};
