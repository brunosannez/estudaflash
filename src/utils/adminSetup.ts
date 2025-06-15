
import { supabase } from '@/integrations/supabase/client';

export const ensureAdminUser = async (email: string) => {
  try {
    // Primeiro, buscar o usuário pelo email na tabela auth.users através da nossa função
    const { data: userData, error: userError } = await supabase.rpc('get_user_by_email', { 
      email_param: email 
    });

    if (userError) {
      console.error('Erro ao buscar usuário:', userError);
      return false;
    }

    if (!userData || userData.length === 0) {
      console.error('Usuário não encontrado:', email);
      return false;
    }

    const userId = userData[0].id;

    // Verificar se já é admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (adminError && adminError.code !== 'PGRST116') {
      console.error('Erro ao verificar admin:', adminError);
      return false;
    }

    if (adminData) {
      console.log('Usuário já é admin');
      return true;
    }

    // Adicionar como admin
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        email: email
      });

    if (insertError) {
      console.error('Erro ao adicionar admin:', insertError);
      return false;
    }

    console.log('Usuário adicionado como admin com sucesso');
    return true;

  } catch (error) {
    console.error('Erro geral:', error);
    return false;
  }
};
