
import { supabase } from '@/integrations/supabase/client';

export const ensureAdminUser = async (email: string) => {
  try {
    // Buscar todos os usuários e filtrar pelo email
    const { data: usersData, error: usersError } = await supabase.rpc('get_all_users_admin');

    if (usersError) {
      console.error('Erro ao buscar usuários:', usersError);
      return false;
    }

    if (!usersData || !Array.isArray(usersData)) {
      console.error('Dados de usuários inválidos');
      return false;
    }

    // Procurar o usuário pelo email
    const userData = usersData.find(user => user.email === email);

    if (!userData) {
      console.error('Usuário não encontrado:', email);
      return false;
    }

    const userId = userData.user_id;

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
