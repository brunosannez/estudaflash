
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
    if (!user) {
      console.log('❌ Usuário não autenticado para promover a admin');
      return false;
    }
    
    try {
      console.log('🔧 useIsAdmin: Promovendo usuário atual a admin...');
      
      // Primeiro, verificar se já existe um admin
      const { data: existingAdmins, error: checkError } = await supabase
        .from('admin_users')
        .select('*')
        .limit(1);

      if (checkError) {
        console.error('❌ Erro ao verificar admins existentes:', checkError);
      }

      // Se não há nenhum admin, tornar o usuário atual admin
      if (!existingAdmins || existingAdmins.length === 0) {
        // Primeiro adicionar em admin_users
        const { error: adminInsertError } = await supabase
          .from('admin_users')
          .insert([
            {
              user_id: user.id,
              email: user.email || 'admin@example.com'
            }
          ]);

        if (adminInsertError) {
          console.error('❌ Erro ao inserir em admin_users:', adminInsertError);
        }

        // Depois atualizar uso_usuarios
        const { error: usageUpdateError } = await supabase
          .from('uso_usuarios')
          .update({ is_admin: true })
          .eq('user_id', user.id);

        if (usageUpdateError) {
          console.error('❌ Erro ao atualizar uso_usuarios:', usageUpdateError);
          return false;
        }

        console.log('✅ Usuário promovido a admin com sucesso');
        setIsAdmin(true);
        
        // Re-executar diagnósticos
        const newDiagnostics = await AdminDiagnosticsService.runDiagnostics();
        setDiagnostics(newDiagnostics);
        
        return true;
      } else {
        console.log('⚠️ Já existe um administrador no sistema');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao promover usuário a admin:', error);
      return false;
    }
  };

  return { 
    isAdmin, 
    loading, 
    diagnostics,
    makeCurrentUserAdmin
  };
};
