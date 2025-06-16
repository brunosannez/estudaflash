
import { supabase } from '@/integrations/supabase/client';

export const summaryDataService = {
  async getResumo(uploadId: string) {
    try {
      console.log('Buscando resumo para upload:', uploadId);
      
      const { data, error } = await supabase
        .from('resumos')
        .select('*')
        .eq('upload_id', uploadId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar resumo:', error);
        throw error;
      }

      if (data) {
        console.log('Resumo encontrado:', data.id);
      } else {
        console.log('Nenhum resumo encontrado para este upload');
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
      return null;
    }
  },

  async getResumoById(resumoId: string) {
    try {
      console.log('Buscando resumo por ID:', resumoId);
      
      const { data, error } = await supabase
        .from('resumos')
        .select('*')
        .eq('id', resumoId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar resumo por ID:', error);
        throw error;
      }

      if (data) {
        console.log('Resumo encontrado por ID:', data.id);
      } else {
        console.log('Nenhum resumo encontrado para este ID');
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar resumo por ID:', error);
      return null;
    }
  },

  async getAllResumos() {
    try {
      console.log('Buscando todos os resumos do usuário');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('resumos')
        .select(`
          *,
          uploads!inner(
            id,
            user_id,
            arquivo_original_nome,
            texto_extraido,
            data_upload
          )
        `)
        .eq('uploads.user_id', user.id)
        .order('data_criacao', { ascending: false });

      if (error) {
        console.error('Erro ao buscar resumos:', error);
        throw error;
      }

      console.log('Resumos encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar todos os resumos:', error);
      return [];
    }
  },

  async updateResumoName(resumoId: string, customName: string) {
    try {
      console.log('Atualizando nome do resumo:', resumoId, customName);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('resumos')
        .update({ custom_name: customName })
        .eq('id', resumoId);

      if (error) {
        console.error('Erro ao atualizar nome do resumo:', error);
        throw error;
      }

      console.log('Nome do resumo atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar nome do resumo:', error);
      throw error;
    }
  }
};
