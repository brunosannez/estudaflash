
import { supabase } from '@/integrations/supabase/client';
import type { SuccessfulUploadResult } from '@/types/upload';
import type { User } from '@supabase/supabase-js';

export const verifyUserAndBucket = async (): Promise<User> => {
  console.log('🔐 Verifying user authentication...');
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('❌ User authentication error:', userError);
      throw new Error(`Falha na autenticação: ${userError.message}`);
    }
    
    if (!user) {
      console.error('❌ No user found');
      throw new Error('Usuário não autenticado. Faça login para continuar.');
    }
    
    console.log('✅ User authenticated:', user.id);

    // Test storage bucket access by attempting to get info about it
    console.log('🪣 Testing storage bucket access...');
    try {
      // Try to get the public URL for a test path to verify bucket exists and is accessible
      const { data: { publicUrl } } = supabase.storage
        .from('study-images')
        .getPublicUrl('test-path');
      
      if (publicUrl && publicUrl.includes('study-images')) {
        console.log('✅ Storage bucket accessible');
      } else {
        throw new Error('Bucket not accessible');
      }
    } catch (bucketError) {
      console.error('❌ Storage bucket test failed:', bucketError);
      throw new Error('Bucket de armazenamento não está configurado corretamente. Contate o suporte.');
    }
    
    return user;
  } catch (error) {
    console.error('❌ Error in verifyUserAndBucket:', error);
    throw error;
  }
};

export const uploadImageToStorage = async (file: File, userId: string, index: number): Promise<string> => {
  try {
    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const fileName = `${userId}/${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    console.log(`📤 Uploading ${file.name} (${fileSizeInMB}MB) to: ${fileName}`);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('study-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload error details:', uploadError);
      
      // Handle specific error cases with more user-friendly messages
      if (uploadError.message.includes('bucket')) {
        throw new Error('Bucket de armazenamento não encontrado. Contate o suporte.');
      }
      if (uploadError.message.includes('permission') || uploadError.message.includes('unauthorized')) {
        throw new Error('Sem permissão para fazer upload. Verifique se está logado.');
      }
      if (uploadError.message.includes('size') || uploadError.message.includes('large')) {
        throw new Error(`Arquivo muito grande (${fileSizeInMB}MB). Escolha uma imagem menor.`);
      }
      if (uploadError.message.includes('duplicate') || uploadError.message.includes('exists')) {
        throw new Error('Arquivo com esse nome já existe. Tente novamente.');
      }
      
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }

    if (!uploadData?.path) {
      throw new Error('Upload concluído mas nenhum caminho foi retornado');
    }

    console.log(`✅ Image ${index + 1} uploaded successfully:`, uploadData.path);

    const { data: { publicUrl } } = supabase.storage
      .from('study-images')
      .getPublicUrl(fileName);

    if (!publicUrl || !publicUrl.includes('study-images')) {
      throw new Error('URL pública inválida gerada');
    }

    console.log(`🔗 Public URL for image ${index + 1}:`, publicUrl);
    return publicUrl;
  } catch (error) {
    console.error(`❌ Error uploading image ${index + 1}:`, error);
    throw error;
  }
};

export const invokeOcrFunction = async (imageUrl: string): Promise<string> => {
  try {
    console.log(`🔍 Starting OCR for image...`);
    
    const { data: extractData, error: extractError } = await supabase.functions
      .invoke('extract-text-from-image', {
        body: { imageUrl }
      });

    if (extractError) {
      console.error('❌ OCR function error:', extractError);
      
      // Provide more specific error messages
      if (extractError.message.includes('network') || extractError.message.includes('fetch')) {
        throw new Error('Erro de conexão durante a extração de texto. Verifique sua internet.');
      }
      if (extractError.message.includes('timeout')) {
        throw new Error('Tempo limite excedido. Tente com uma imagem menor.');
      }
      
      throw new Error(`Falha na extração de texto: ${extractError.message}`);
    }

    if (!extractData?.success) {
      console.error('❌ OCR function returned error:', extractData?.error);
      
      // Handle specific OCR errors
      const errorMsg = extractData?.error || 'Erro desconhecido na extração de texto';
      if (errorMsg.includes('muito grande')) {
        throw new Error('Imagem muito grande para processar. Use uma imagem menor (máximo 10MB).');
      }
      if (errorMsg.includes('API')) {
        throw new Error('Serviço de OCR temporariamente indisponível. Tente novamente.');
      }
      
      throw new Error(errorMsg);
    }
    
    const extractedTextLength = extractData.extractedText?.length || 0;
    console.log(`✅ OCR completed. Text length:`, extractedTextLength);

    if (extractedTextLength === 0) {
      console.log('⚠️ No text found in image');
    }

    return extractData.extractedText || '';
  } catch (error) {
    console.error('❌ Error in OCR process:', error);
    throw error;
  }
};

export const saveUploadRecord = async (userId: string, successfulResults: SuccessfulUploadResult[]) => {
  try {
    const combinedText = successfulResults
      .map((result, index) => {
        const originalIndex = index + 1;
        const textPreview = result.extractedText.length > 100 
          ? result.extractedText.substring(0, 100) + '...' 
          : result.extractedText;
        return `--- Imagem ${originalIndex} (${result.file.name}) ---\n${result.extractedText}`;
      })
      .join('\n\n');

    console.log('📝 Combined text length:', combinedText.length);
    console.log('📊 Images processed:', successfulResults.length);
    
    if (!combinedText.trim()) {
      throw new Error('Nenhum texto foi extraído das imagens');
    }
    
    // Get the original file name from the first file
    const arquivoOriginalNome = successfulResults.length > 1 
      ? `${successfulResults.length} arquivos processados`
      : successfulResults[0].file.name;
    
    console.log('💾 Saving to database...');
    const { data: uploadRecord, error: dbError } = await supabase
      .from('uploads')
      .insert({
        user_id: userId,
        imagem_url: successfulResults[0].imageUrl,
        texto_extraido: combinedText,
        arquivo_original_nome: arquivoOriginalNome
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      
      // Handle specific database errors
      if (dbError.message.includes('foreign key')) {
        throw new Error('Erro de autenticação. Faça login novamente.');
      }
      if (dbError.message.includes('too long') || dbError.message.includes('value too long')) {
        throw new Error('Texto extraído muito longo para salvar. Tente com menos imagens.');
      }
      
      throw new Error(`Falha ao salvar no banco: ${dbError.message}`);
    }

    if (!uploadRecord) {
      throw new Error('Registro de upload não foi criado');
    }

    console.log('✅ Upload record saved:', uploadRecord.id);
    return uploadRecord;
  } catch (error) {
    console.error('❌ Error saving upload record:', error);
    throw error;
  }
};
