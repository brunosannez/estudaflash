
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
      
      console.log('Starting upload process for file:', file.name, file.size, file.type);
      
      // Verificar se o usuário está autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Auth error:', userError);
        throw new Error(`Erro de autenticação: ${userError.message}`);
      }
      
      if (!user) {
        console.error('User not authenticated');
        throw new Error('Usuário não autenticado');
      }

      console.log('User authenticated:', user.id);

      // Verificar se o bucket existe
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        throw new Error(`Erro ao verificar storage: ${bucketsError.message}`);
      }
      
      const studyImagesBucket = buckets.find(bucket => bucket.id === 'study-images');
      if (!studyImagesBucket) {
        console.error('study-images bucket not found');
        throw new Error('Bucket de imagens não configurado. Contate o suporte.');
      }

      console.log('Storage bucket verified');

      // Upload da imagem para o Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      console.log('Uploading to path:', fileName);
      
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

      console.log('OCR response:', extractData);

      if (!extractData || !extractData.success) {
        const errorMsg = extractData?.error || 'Erro desconhecido na extração de texto';
        console.error('OCR failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('Text extraction completed, text length:', extractData.extractedText?.length || 0);

      setIsExtracting(false);

      // Salvar no banco de dados com nome original do arquivo
      const { data: uploadRecord, error: dbError } = await supabase
        .from('uploads')
        .insert({
          user_id: user.id,
          imagem_url: publicUrl,
          texto_extraido: extractData.extractedText || '',
          arquivo_original_nome: file.name
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
      
      let errorMessage = "Erro ao processar a imagem.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
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
