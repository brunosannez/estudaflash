
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const uploadImageAndExtractText = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Starting file upload for user:', user.id);

      // Upload da imagem para o Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('study-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log('File uploaded successfully:', uploadData.path);

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('study-images')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);

      setIsUploading(false);
      setIsExtracting(true);

      console.log('Starting text extraction...');

      // Chamar função edge para extrair texto
      const { data: extractData, error: extractError } = await supabase.functions
        .invoke('extract-text-from-image', {
          body: { imageUrl: publicUrl }
        });

      if (extractError) {
        console.error('Text extraction error:', extractError);
        throw new Error(`Erro na extração de texto: ${extractError.message}`);
      }

      if (!extractData.success) {
        throw new Error(extractData.error || 'Erro na extração de texto');
      }

      console.log('Text extraction completed');

      setIsExtracting(false);

      // Salvar no banco de dados
      const { data: uploadRecord, error: dbError } = await supabase
        .from('uploads')
        .insert({
          user_id: user.id,
          imagem_url: publicUrl,
          texto_extraido: extractData.extractedText
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Erro ao salvar no banco: ${dbError.message}`);
      }

      console.log('Upload record saved:', uploadRecord.id);

      toast({
        title: "Sucesso!",
        description: "Texto extraído com sucesso da imagem.",
      });

      return uploadRecord;

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar a imagem.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
      setIsExtracting(false);
    }
  };

  return {
    uploadImageAndExtractText,
    isUploading,
    isExtracting
  };
};
