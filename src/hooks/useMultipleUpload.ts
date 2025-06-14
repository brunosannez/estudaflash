
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
      
      console.log('=== 🚀 INICIANDO PROCESSO DE UPLOAD MÚLTIPLO ===');
      console.log('📁 Arquivos para processar:', files.map(f => ({ 
        name: f.name, 
        size: f.size, 
        type: f.type,
        sizeKB: Math.round(f.size / 1024)
      })));
      
      // Validar arquivos antes de continuar
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        console.error('❌ Arquivos inválidos encontrados:', invalidFiles.map(f => f.name));
        throw new Error(`Arquivos inválidos: ${invalidFiles.map(f => f.name).join(', ')}`);
      }
      
      // Verificar se o usuário está autenticado
      console.log('🔐 Verificando autenticação do usuário...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('❌ Erro de autenticação:', userError);
        throw new Error(`Erro de autenticação: ${userError.message}`);
      }
      
      if (!user) {
        console.error('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado. Faça login para continuar.');
      }

      console.log('✅ Usuário autenticado:', user.id);

      // Verificar se o bucket existe
      console.log('🗄️ Verificando bucket de storage...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('❌ Erro ao listar buckets:', bucketsError);
        throw new Error(`Erro ao verificar storage: ${bucketsError.message}`);
      }
      
      const studyImagesBucket = buckets.find(bucket => bucket.id === 'study-images');
      if (!studyImagesBucket) {
        console.error('❌ Bucket study-images não encontrado. Buckets disponíveis:', buckets.map(b => b.id));
        throw new Error('Bucket de imagens não configurado. Contate o suporte.');
      }

      console.log('✅ Bucket de storage verificado');

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
        console.log(`=== 🖼️ PROCESSANDO IMAGEM ${i + 1}/${files.length}: ${file.name} ===`);
        
        try {
          // Validar tamanho do arquivo (máximo 10MB)
          if (file.size > 10 * 1024 * 1024) {
            throw new Error(`Arquivo muito grande (${Math.round(file.size / 1024 / 1024)}MB). Máximo: 10MB`);
          }
          
          // Atualizar status para uploading
          setUploadResults(prev => prev.map((result, index) => 
            index === i ? { ...result, status: 'uploading' } : result
          ));

          // Upload da imagem
          const fileName = `${user.id}/${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          console.log(`📤 Fazendo upload para: ${fileName}`);
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('study-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error(`❌ Erro no upload da imagem ${i + 1}:`, uploadError);
            throw new Error(`Erro no upload: ${uploadError.message}`);
          }

          console.log(`✅ Imagem ${i + 1} enviada com sucesso:`, uploadData?.path);

          // Obter URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('study-images')
            .getPublicUrl(fileName);

          console.log(`🔗 URL pública da imagem ${i + 1}:`, publicUrl);

          // Verificar se a URL é válida
          if (!publicUrl || !publicUrl.includes('study-images')) {
            throw new Error('URL pública inválida gerada');
          }

          // Atualizar status para extracting
          setUploadResults(prev => prev.map((result, index) => 
            index === i ? { ...result, status: 'extracting', imageUrl: publicUrl } : result
          ));

          console.log(`🔍 Iniciando OCR para imagem ${i + 1}...`);

          // Extrair texto
          const { data: extractData, error: extractError } = await supabase.functions
            .invoke('extract-text-from-image', {
              body: { imageUrl: publicUrl }
            });

          console.log(`📄 Resposta do OCR para imagem ${i + 1}:`, extractData);

          if (extractError) {
            console.error(`❌ Erro do OCR para imagem ${i + 1}:`, extractError);
            throw new Error(`Erro na extração de texto: ${extractError.message}`);
          }

          if (!extractData?.success) {
            console.error(`❌ OCR falhou para imagem ${i + 1}:`, extractData?.error);
            throw new Error(extractData?.error || 'Erro na extração de texto');
          }

          const extractedTextLength = extractData.extractedText?.length || 0;
          console.log(`✅ OCR concluído para imagem ${i + 1}. Comprimento do texto:`, extractedTextLength);

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
          console.error(`❌ Erro ao processar imagem ${i + 1}:`, error);
          
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
      console.log(`📊 Processamento concluído. Sucessos: ${successfulResults.length}/${files.length}`);

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

      console.log('📝 Comprimento do texto combinado:', combinedText.length);

      // Salvar no banco de dados como um único registro
      console.log('💾 Salvando no banco de dados...');
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
        console.error('❌ Erro no banco de dados:', dbError);
        throw new Error(`Erro ao salvar no banco: ${dbError.message}`);
      }

      console.log('✅ Registro de upload salvo:', uploadRecord.id);

      toast({
        title: "Sucesso!",
        description: `${successfulResults.length} de ${files.length} imagens processadas com sucesso.`,
      });

      console.log('=== ✅ PROCESSO DE UPLOAD MÚLTIPLO CONCLUÍDO ===');
      return uploadRecord;

    } catch (error) {
      console.error('=== ❌ PROCESSO DE UPLOAD MÚLTIPLO FALHOU ===');
      console.error('Detalhes do erro:', error);
      
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
    console.log('🔄 Resetando estado do upload');
    setUploadResults([]);
  };

  return {
    uploadMultipleImages,
    uploadResults,
    isProcessing,
    resetUpload
  };
};
