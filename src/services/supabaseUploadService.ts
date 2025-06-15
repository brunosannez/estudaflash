
import { supabase } from '@/integrations/supabase/client';
import type { SuccessfulUploadResult } from '@/types/upload';
import type { User } from '@supabase/supabase-js';
import { StorageService } from './storageService';

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
    const result = await StorageService.uploadImage(file, userId, index);
    console.log(`📤 Upload result for image ${index + 1}: size=${result.fileSize} bytes`);
    return result.publicUrl;
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
        return `--- Imagem ${originalIndex} (${result.file.name}) ---\n${result.extractedText}`;
      })
      .join('\n\n');

    console.log('📝 Combined text length:', combinedText.length);
    console.log('📊 Images processed:', successfulResults.length);
    
    if (!combinedText.trim()) {
      throw new Error('Nenhum texto foi extraído das imagens');
    }
    
    // Calculate total file size properly and log each file
    const totalFileSize = successfulResults.reduce((total, result) => {
      console.log(`📏 File ${result.file.name}: ${result.file.size} bytes`);
      return total + result.file.size;
    }, 0);
    
    console.log('📏 Total file size calculated:', totalFileSize, 'bytes');
    console.log('📋 File details:', successfulResults.map(r => ({ 
      name: r.file.name, 
      size: r.file.size,
      sizeInMB: (r.file.size / (1024 * 1024)).toFixed(2)
    })));
    
    // Get the original file name from the first file
    const arquivoOriginalNome = successfulResults.length > 1 
      ? `${successfulResults.length} arquivos processados`
      : successfulResults[0].file.name;
    
    console.log('💾 Saving to database with file_size:', totalFileSize, 'bytes');
    const { data: uploadRecord, error: dbError } = await supabase
      .from('uploads')
      .insert({
        user_id: userId,
        imagem_url: successfulResults[0].imageUrl,
        texto_extraido: combinedText,
        arquivo_original_nome: arquivoOriginalNome,
        file_size: totalFileSize // Garantir que o file_size seja salvo corretamente
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

    console.log('✅ Upload record saved with file_size:', uploadRecord.file_size, 'bytes');
    console.log('✅ Upload record created:', {
      id: uploadRecord.id,
      file_size: uploadRecord.file_size,
      file_size_mb: uploadRecord.file_size ? (uploadRecord.file_size / (1024 * 1024)).toFixed(2) : '0',
      arquivo_original_nome: uploadRecord.arquivo_original_nome
    });
    
    return uploadRecord;
  } catch (error) {
    console.error('❌ Error saving upload record:', error);
    throw error;
  }
};
