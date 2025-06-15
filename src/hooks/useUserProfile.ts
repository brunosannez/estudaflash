
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

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return;
      }

      setProfile(data);
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

  return {
    profile,
    loading,
    getDisplayName,
    getFullName,
    refetch: fetchProfile
  };
};
