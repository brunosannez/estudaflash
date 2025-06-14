
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ImageUploadResult {
  file: File;
  status: 'pending' | 'uploading' | 'extracting' | 'completed' | 'error';
  imageUrl?: string;
  extractedText?: string;
  error?: string;
}

export const useMultipleUpload = () => {
  const [uploadResults, setUploadResults] = useState<ImageUploadResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const uploadMultipleImages = async (files: File[]) => {
    try {
      setIsProcessing(true);
      
      console.log('Starting multiple upload process for files:', files.map(f => f.name));
      
      // Verificar se o usuário está autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('User authenticated:', user.id);

      // Inicializar resultados
      const initialResults: ImageUploadResult[] = files.map(file => ({
        file,
        status: 'pending'
      }));
      setUploadResults(initialResults);

      // Processar cada imagem
      const finalResults: ImageUploadResult[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing image ${i + 1}/${files.length}:`, file.name);
        
        try {
          // Atualizar status para uploading
          setUploadResults(prev => prev.map((result, index) => 
            index === i ? { ...result, status: 'uploading' } : result
          ));

          // Upload da imagem
          const fileName = `${user.id}/${Date.now()}-${i}-${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('study-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            throw new Error(`Erro no upload: ${uploadError.message}`);
          }

          // Obter URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('study-images')
            .getPublicUrl(fileName);

          // Atualizar status para extracting
          setUploadResults(prev => prev.map((result, index) => 
            index === i ? { ...result, status: 'extracting', imageUrl: publicUrl } : result
          ));

          console.log(`Extracting text from image ${i + 1}...`);

          // Extrair texto
          const { data: extractData, error: extractError } = await supabase.functions
            .invoke('extract-text-from-image', {
              body: { imageUrl: publicUrl }
            });

          if (extractError || !extractData?.success) {
            throw new Error(extractData?.error || 'Erro na extração de texto');
          }

          // Atualizar status para completed
          const result: ImageUploadResult = {
            file,
            status: 'completed',
            imageUrl: publicUrl,
            extractedText: extractData.extractedText || ''
          };

          setUploadResults(prev => prev.map((resultItem, index) => 
            index === i ? result : resultItem
          ));

          finalResults.push(result);

        } catch (error) {
          console.error(`Error processing image ${i + 1}:`, error);
          
          const errorResult: ImageUploadResult = {
            file,
            status: 'error',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          };

          setUploadResults(prev => prev.map((result, index) => 
            index === i ? errorResult : result
          ));

          finalResults.push(errorResult);
        }
      }

      // Combinar textos extraídos com sucesso
      const successfulResults = finalResults.filter(r => r.status === 'completed');
      const combinedText = successfulResults
        .map((result, index) => `--- Imagem ${index + 1} (${result.file.name}) ---\n${result.extractedText}`)
        .join('\n\n');

      if (successfulResults.length === 0) {
        throw new Error('Nenhuma imagem foi processada com sucesso');
      }

      console.log('Combined text length:', combinedText.length);

      // Salvar no banco de dados como um único registro
      const { data: uploadRecord, error: dbError } = await supabase
        .from('uploads')
        .insert({
          user_id: user.id,
          imagem_url: successfulResults[0].imageUrl, // URL da primeira imagem como referência
          texto_extraido: combinedText
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Erro ao salvar no banco: ${dbError.message}`);
      }

      console.log('Upload record saved:', uploadRecord.id);

      toast({
        title: "Sucesso!",
        description: `${successfulResults.length} de ${files.length} imagens processadas com sucesso.`,
      });

      return uploadRecord;

    } catch (error) {
      console.error('Erro no upload múltiplo:', error);
      
      let errorMessage = "Erro ao processar as imagens.";
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
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setUploadResults([]);
  };

  return {
    uploadMultipleImages,
    uploadResults,
    isProcessing,
    resetUpload
  };
};
