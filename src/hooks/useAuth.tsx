
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
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          throw error;
        }

        setAuthState({
          user: session?.user || null,
          session: session || null,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('Erro na autenticação:', error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: error.message,
        });
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      setAuthState({
        user: session?.user || null,
        session: session || null,
        loading: false,
        error: null,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        throw error;
      }

      console.log('Login realizado com sucesso:', data.user?.email);
      
      setAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return data;
    } catch (error: any) {
      console.error('Erro no signIn:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: metadata || {}
        }
      });

      if (error) {
        console.error('Erro no cadastro:', error);
        throw error;
      }

      console.log('Cadastro realizado:', data.user?.email);
      
      // O trigger handle_new_user_setup criará automaticamente os registros necessários
      
      setAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      });

      return data;
    } catch (error: any) {
      console.error('Erro no signUp:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erro no logout:', error);
        throw error;
      }

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Erro no signOut:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
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
