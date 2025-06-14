
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
      
      console.log('=== STARTING MULTIPLE UPLOAD PROCESS ===');
      console.log('Files to process:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
      
      // Verificar se o usuário está autenticado
      console.log('Checking user authentication...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Authentication error:', userError);
        throw new Error(`Erro de autenticação: ${userError.message}`);
      }
      
      if (!user) {
        console.error('User not authenticated');
        throw new Error('Usuário não autenticado');
      }

      console.log('User authenticated successfully:', user.id);

      // Verificar se o bucket existe
      console.log('Checking storage bucket...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        throw new Error(`Erro ao verificar storage: ${bucketsError.message}`);
      }
      
      const studyImagesBucket = buckets.find(bucket => bucket.id === 'study-images');
      if (!studyImagesBucket) {
        console.error('study-images bucket not found. Available buckets:', buckets.map(b => b.id));
        throw new Error('Bucket de imagens não configurado. Contate o suporte.');
      }

      console.log('Storage bucket verified successfully');

      // Inicializar resultados
      const initialResults: ImageUploadResult[] = files.map(file => ({
        file,
        status: 'pending'
      }));
      setUploadResults(initialResults);

      // Processar cada imagem sequencialmente para melhor controle
      const finalResults: ImageUploadResult[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`=== PROCESSING IMAGE ${i + 1}/${files.length}: ${file.name} ===`);
        
        try {
          // Atualizar status para uploading
          setUploadResults(prev => prev.map((result, index) => 
            index === i ? { ...result, status: 'uploading' } : result
          ));

          // Upload da imagem
          const fileName = `${user.id}/${Date.now()}-${i}-${file.name}`;
          console.log(`Uploading to path: ${fileName}`);
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('study-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error(`Upload error for image ${i + 1}:`, uploadError);
            throw new Error(`Erro no upload: ${uploadError.message}`);
          }

          console.log(`Image ${i + 1} uploaded successfully:`, uploadData?.path);

          // Obter URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('study-images')
            .getPublicUrl(fileName);

          console.log(`Public URL for image ${i + 1}:`, publicUrl);

          // Atualizar status para extracting
          setUploadResults(prev => prev.map((result, index) => 
            index === i ? { ...result, status: 'extracting', imageUrl: publicUrl } : result
          ));

          console.log(`Starting OCR for image ${i + 1}...`);

          // Extrair texto
          const { data: extractData, error: extractError } = await supabase.functions
            .invoke('extract-text-from-image', {
              body: { imageUrl: publicUrl }
            });

          console.log(`OCR response for image ${i + 1}:`, extractData);

          if (extractError) {
            console.error(`OCR error for image ${i + 1}:`, extractError);
            throw new Error(`Erro na extração de texto: ${extractError.message}`);
          }

          if (!extractData?.success) {
            console.error(`OCR failed for image ${i + 1}:`, extractData?.error);
            throw new Error(extractData?.error || 'Erro na extração de texto');
          }

          console.log(`OCR completed for image ${i + 1}. Text length:`, extractData.extractedText?.length || 0);

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

      // Verificar se pelo menos uma imagem foi processada com sucesso
      const successfulResults = finalResults.filter(r => r.status === 'completed');
      console.log(`Processing completed. Successful: ${successfulResults.length}/${files.length}`);

      if (successfulResults.length === 0) {
        throw new Error('Nenhuma imagem foi processada com sucesso');
      }

      // Combinar textos extraídos com sucesso
      const combinedText = successfulResults
        .map((result, index) => {
          const originalIndex = finalResults.indexOf(result);
          return `--- Imagem ${originalIndex + 1} (${result.file.name}) ---\n${result.extractedText}`;
        })
        .join('\n\n');

      console.log('Combined text length:', combinedText.length);

      // Salvar no banco de dados como um único registro
      console.log('Saving to database...');
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
        console.error('Database error:', dbError);
        throw new Error(`Erro ao salvar no banco: ${dbError.message}`);
      }

      console.log('Upload record saved successfully:', uploadRecord.id);

      toast({
        title: "Sucesso!",
        description: `${successfulResults.length} de ${files.length} imagens processadas com sucesso.`,
      });

      console.log('=== MULTIPLE UPLOAD PROCESS COMPLETED ===');
      return uploadRecord;

    } catch (error) {
      console.error('=== MULTIPLE UPLOAD PROCESS FAILED ===');
      console.error('Error details:', error);
      
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
    console.log('Resetting upload state');
    setUploadResults([]);
  };

  return {
    uploadMultipleImages,
    uploadResults,
    isProcessing,
    resetUpload
  };
};
