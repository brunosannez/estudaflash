import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: any;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const getSession = async () => {
      try {
        setAuthState(prev => ({ ...prev, loading: true }));
        
        const { data: { session } } = await supabase.auth.getSession();

        setAuthState({
          user: session?.user || null,
          session: session || null,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: error.message,
        });
      }
    };

    getSession();

    supabase.auth.onAuthStateChange((event, session) => {
      setAuthState({
        user: session?.user || null,
        session: session || null,
        loading: false,
        error: null,
      });
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return data;
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string, selectedPlanId?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Get Free plan ID if no plan selected
        let planId = selectedPlanId;
        if (!planId) {
          const { data: freePlan } = await supabase
            .from('plans')
            .select('id')
            .eq('name', 'Free')
            .single();
          
          planId = freePlan?.id;
        }

        // Initialize user usage data with selected plan
        const { error: usageError } = await supabase
          .from('uso_usuarios')
          .insert({
            user_id: data.user.id,
            plan_id: planId,
            plano: 'free', // Keep for backwards compatibility
            is_admin: false,
            uploads_realizados: 0,
            flashcards_gerados: 0,
            quizzes_realizados: 0,
          });

        if (usageError) {
          console.error('Error initializing user usage:', usageError);
        }
      }

      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
      throw error;
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
  };
};
