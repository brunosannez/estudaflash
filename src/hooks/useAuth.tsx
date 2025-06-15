
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { PlanType } from '@/types/plans';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar usuário atual
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Sucesso!",
      description: "Login realizado com sucesso.",
    });
    return true;
  };

  const signUpWithEmail = async (email: string, password: string, selectedPlan: PlanType = 'free') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          plan: selectedPlan
        }
      }
    });

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    // If user is immediately confirmed, create the usage record
    if (data.user && !data.user.email_confirmed_at) {
      // User needs email confirmation
      toast({
        title: "Sucesso!",
        description: "Conta criada com sucesso. Verifique seu email.",
      });
    } else if (data.user) {
      // User is immediately confirmed, create usage record
      await createUserUsageRecord(data.user.id, selectedPlan);
      toast({
        title: "Sucesso!",
        description: "Conta criada com sucesso!",
      });
    }

    return true;
  };

  const createUserUsageRecord = async (userId: string, plan: PlanType) => {
    try {
      const { error } = await supabase
        .from('uso_usuarios')
        .insert({
          user_id: userId,
          plano: plan,
          is_admin: false,
          uploads_realizados: 0,
          flashcards_gerados: 0,
          quizzes_realizados: 0,
        });

      if (error) {
        console.error('Error creating user usage record:', error);
      }
    } catch (err) {
      console.error('Error in createUserUsageRecord:', err);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso!",
        description: "Logout realizado com sucesso.",
      });
    }
  };

  return {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
};
