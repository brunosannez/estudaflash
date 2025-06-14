
import { supabase } from '@/integrations/supabase/client';
import type { SuccessfulUploadResult } from '@/types/upload';
import type { User } from '@supabase/supabase-js';

export const verifyUserAndBucket = async (): Promise<User> => {
  console.log('🔐 Verifying user authentication...');
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('❌ User authentication error:', userError);
      throw new Error(`User authentication failed: ${userError.message}`);
    }
    
    if (!user) {
      console.error('❌ No user found');
      throw new Error('User not authenticated. Please log in to continue.');
    }
    
    console.log('✅ User authenticated:', user.id);

    // Instead of listing buckets, we'll test upload permissions directly
    console.log('✅ Skipping bucket verification - will test upload directly');
    
    return user;
  } catch (error) {
    console.error('❌ Error in verifyUserAndBucket:', error);
    throw error;
  }
};

export const uploadImageToStorage = async (file: File, userId: string, index: number): Promise<string> => {
  try {
    const fileName = `${userId}/${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    console.log(`📤 Uploading to: ${fileName}`);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('study-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload error details:', uploadError);
      
      // Handle specific error cases
      if (uploadError.message.includes('bucket')) {
        throw new Error('Storage bucket is not configured properly. Please contact support.');
      }
      if (uploadError.message.includes('permission')) {
        throw new Error('You do not have permission to upload files. Please check your authentication.');
      }
      if (uploadError.message.includes('size')) {
        throw new Error('File is too large. Please choose a smaller image.');
      }
      
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    if (!uploadData?.path) {
      throw new Error('Upload completed but no file path was returned');
    }

    console.log(`✅ Image ${index + 1} uploaded successfully:`, uploadData.path);

    const { data: { publicUrl } } = supabase.storage
      .from('study-images')
      .getPublicUrl(fileName);

    if (!publicUrl || !publicUrl.includes('study-images')) {
      throw new Error('Invalid public URL generated');
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
      throw new Error(`Text extraction failed: ${extractError.message}`);
    }

    if (!extractData?.success) {
      console.error('❌ OCR function returned error:', extractData?.error);
      throw new Error(extractData?.error || 'Failed to extract text from image');
    }
    
    const extractedTextLength = extractData.extractedText?.length || 0;
    console.log(`✅ OCR completed. Text length:`, extractedTextLength);

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
    
    if (!combinedText.trim()) {
      throw new Error('No text was extracted from any images');
    }
    
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
      console.error('❌ Database error:', dbError);
      throw new Error(`Failed to save upload record: ${dbError.message}`);
    }

    if (!uploadRecord) {
      throw new Error('Upload record was not created');
    }

    console.log('✅ Upload record saved:', uploadRecord.id);
    return uploadRecord;
  } catch (error) {
    console.error('❌ Error saving upload record:', error);
    throw error;
  }
};
