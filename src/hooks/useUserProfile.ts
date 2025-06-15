
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string | null;
  date_of_birth: string;
  school_year: string | null;
  is_minor: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          throw error;
        }

        setProfile(data);
      } catch (error: any) {
        console.error('Error fetching user profile:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const getDisplayName = () => {
    if (profile?.username) {
      return profile.username;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuário';
  };

  return {
    profile,
    loading,
    error,
    getDisplayName,
  };
};
