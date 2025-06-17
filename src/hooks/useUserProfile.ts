
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
        console.log('🔍 Buscando perfil do usuário:', user.id);
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.warn('⚠️ Perfil não encontrado, usando dados do auth');
          } else {
            console.error('❌ Erro ao buscar perfil:', error);
          }
        } else {
          console.log('✅ Perfil encontrado:', data);
          setProfile(data);
        }
      } catch (error) {
        console.error('💥 Erro ao buscar perfil do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const getDisplayName = (): string => {
    // 1. Usar full_name do perfil se disponível
    if (profile?.full_name) {
      const firstName = profile.full_name.split(' ')[0];
      return firstName;
    }
    
    // 2. Usar username do perfil se disponível
    if (profile?.username) {
      return profile.username;
    }
    
    // 3. Usar email como fallback
    if (user?.email) {
      const emailUsername = user.email.split('@')[0];
      return emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
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
