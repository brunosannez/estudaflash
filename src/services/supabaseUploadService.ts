
import { supabase } from '@/integrations/supabase/client';
import type { SuccessfulUploadResult } from '@/types/upload';
import type { User } from '@supabase/supabase-js';

export const verifyUserAndBucket = async (): Promise<User> => {
  console.log('🔐 Verifying user authentication...');
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('User not authenticated. Please log in to continue.');
  }
  console.log('✅ User authenticated:', user.id);

  console.log('🗄️ Verifying storage bucket...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    throw new Error(`Error verifying storage: ${bucketsError.message}`);
  }
  const studyImagesBucket = buckets.find(bucket => bucket.id === 'study-images');
  if (!studyImagesBucket) {
    throw new Error('Image bucket not configured. Contact support.');
  }
  console.log('✅ Storage bucket verified');

  return user;
};

export const uploadImageToStorage = async (file: File, userId: string, index: number): Promise<string> => {
    const fileName = `${userId}/${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    console.log(`📤 Uploading to: ${fileName}`);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('study-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload error: ${uploadError.message}`);
    }

    console.log(`✅ Image ${index + 1} uploaded successfully:`, uploadData?.path);

    const { data: { publicUrl } } = supabase.storage
      .from('study-images')
      .getPublicUrl(fileName);

    if (!publicUrl || !publicUrl.includes('study-images')) {
        throw new Error('Invalid public URL generated');
    }

    console.log(`🔗 Public URL for image ${index + 1}:`, publicUrl);
    return publicUrl;
};

export const invokeOcrFunction = async (imageUrl: string): Promise<string> => {
    console.log(`🔍 Starting OCR for image...`);
    const { data: extractData, error: extractError } = await supabase.functions
      .invoke('extract-text-from-image', {
        body: { imageUrl }
      });

    if (extractError) {
        throw new Error(`Text extraction error: ${extractError.message}`);
    }

    if (!extractData?.success) {
        throw new Error(extractData?.error || 'Failed to extract text');
    }
    
    const extractedTextLength = extractData.extractedText?.length || 0;
    console.log(`✅ OCR completed. Text length:`, extractedTextLength);

    return extractData.extractedText || '';
};

export const saveUploadRecord = async (userId: string, successfulResults: SuccessfulUploadResult[]) => {
    const combinedText = successfulResults
      .map((result, index) => {
        const originalIndex = index + 1;
        return `--- Imagem ${originalIndex} (${result.file.name}) ---\n${result.extractedText}`;
      })
      .join('\n\n');

    console.log('📝 Combined text length:', combinedText.length);
    
    console.log('💾 Saving to database...');
    const { data: uploadRecord, error: dbError } = await supabase
      .from('uploads')
      .insert({
        user_id: userId,
        imagem_url: successfulResults[0].imageUrl,
        texto_extraido: combinedText
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Error saving to database: ${dbError.message}`);
    }

    console.log('✅ Upload record saved:', uploadRecord.id);
    return uploadRecord;
};
