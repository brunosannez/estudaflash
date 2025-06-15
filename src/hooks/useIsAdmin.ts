
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminDiagnosticsService } from '@/services/adminDiagnosticsService';

export const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [diagnostics, setDiagnostics] = useState<any>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('🔍 useIsAdmin: Iniciando verificação detalhada de admin');
      
      if (!user) {
        console.log('❌ useIsAdmin: Usuário não autenticado');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 useIsAdmin: Executando diagnósticos completos...');
        
        // Executar diagnósticos completos
        const diagnosticsResult = await AdminDiagnosticsService.runDiagnostics();
        setDiagnostics(diagnosticsResult);

        console.log('📊 useIsAdmin: Resultado dos diagnósticos:', diagnosticsResult);

        if (diagnosticsResult.isAdmin) {
          console.log('✅ useIsAdmin: Usuário confirmado como admin via', diagnosticsResult.adminCheckMethod);
          setIsAdmin(true);
        } else {
          console.log('❌ useIsAdmin: Usuário não é admin');
          console.log('🔍 useIsAdmin: Detalhes do usuário:', diagnosticsResult.userRecord);
          
          // Se os diagnósticos indicam problemas, tentar corrigi-los
          if (diagnosticsResult.errors.length > 0) {
            console.log('⚠️ useIsAdmin: Erros encontrados:', diagnosticsResult.errors);
          }
          
          setIsAdmin(false);
        }

      } catch (error) {
        console.error('💥 useIsAdmin: Erro geral na verificação:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
        console.log('🏁 useIsAdmin: Verificação concluída');
      }
    };

    checkAdminStatus();
  }, [user]);

  const makeCurrentUserAdmin = async () => {
    if (!user) return false;
    
    console.log('🔧 useIsAdmin: Promovendo usuário atual a admin...');
    const success = await AdminDiagnosticsService.ensureUserIsAdmin(user.id);
    
    if (success) {
      setIsAdmin(true);
      // Re-executar diagnósticos
      const newDiagnostics = await AdminDiagnosticsService.runDiagnostics();
      setDiagnostics(newDiagnostics);
    }
    
    return success;
  };

  return { 
    isAdmin, 
    loading, 
    diagnostics,
    makeCurrentUserAdmin
  };
};
