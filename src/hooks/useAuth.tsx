
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
    let isMounted = true;

    console.log('🔐 useAuth - Setting up auth state...');

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email);
      
      if (isMounted) {
        setAuthState({
          user: session?.user || null,
          session: session || null,
          loading: false,
          error: null,
        });
      }
    });

    // THEN check for existing session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          throw error;
        }

        console.log('📋 Initial session check:', session?.user?.email || 'No user');

        if (isMounted) {
          setAuthState({
            user: session?.user || null,
            session: session || null,
            loading: false,
            error: null,
          });
        }
      } catch (error: any) {
        console.error('❌ Auth initialization error:', error);
        if (isMounted) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: error.message,
          });
        }
      }
    };

    getSession();

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Signing in user:', email);
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
        throw error;
      }

      console.log('✅ Sign in successful:', data.user?.email);
      return data;
    } catch (error: any) {
      console.error('❌ signIn error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      console.log('📝 Signing up user:', email);
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `https://estudaflash.com/`,
          data: metadata || {}
        }
      });

      if (error) {
        console.error('❌ Sign up error:', error);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
        throw error;
      }

      console.log('✅ Sign up successful:', data.user?.email);
      return data;
    } catch (error: any) {
      console.error('❌ signUp error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user');
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }

      // Clear all cached data on logout for security
      clearCacheOnLogout();

      console.log('✅ Sign out successful');
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('❌ signOut error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
      throw error;
    }
  };

  // Security: Clear all cached data when user logs out
  const clearCacheOnLogout = () => {
    try {
      // Clear offline manager cache
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('cache_') || key === 'pending_actions')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear error logs (they may contain session-specific URLs)
      localStorage.removeItem('app_errors');
      
      console.log('🧹 Cleared cached data on logout');
    } catch (error) {
      console.warn('Failed to clear cache on logout:', error);
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
  };
};
