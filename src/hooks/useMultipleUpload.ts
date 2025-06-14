
import { useToast } from '@/hooks/use-toast';
import { useMultipleUploadState } from './useMultipleUploadState';
import { validateFiles } from '@/utils/fileValidator';
import { 
  verifyUserAndBucket, 
  uploadImageToStorage, 
  invokeOcrFunction, 
  saveUploadRecord 
} from '@/services/supabaseUploadService';
import type { ImageUploadResult, SuccessfulUploadResult } from '@/types/upload';

export { ImageUploadResult };

export const useMultipleUpload = () => {
  const { toast } = useToast();
  const {
    uploadResults,
    isProcessing,
    setIsProcessing,
    initializeResults,
    updateResult,
    resetUpload,
  } = useMultipleUploadState();

  const uploadMultipleImages = async (files: File[]) => {
    try {
      setIsProcessing(true);
      console.log('=== 🚀 STARTING MULTIPLE UPLOAD PROCESS ===');
      console.log(`📁 Files to process: ${files.length}`);
      
      // Validate files first
      try {
        validateFiles(files);
        console.log('✅ File validation passed');
      } catch (validationError) {
        console.error('❌ File validation failed:', validationError);
        throw validationError;
      }

      // Verify user authentication
      let user;
      try {
        user = await verifyUserAndBucket();
        console.log('✅ User verification passed');
      } catch (authError) {
        console.error('❌ User verification failed:', authError);
        throw authError;
      }

      initializeResults(files);

      const finalResults: ImageUploadResult[] = [];
      let successCount = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`=== 🖼️ PROCESSING IMAGE ${i + 1}/${files.length}: ${file.name} ===`);
        
        try {
          // Upload phase
          updateResult(i, { status: 'uploading' });
          console.log(`📤 Uploading image ${i + 1}...`);
          
          let publicUrl;
          try {
            publicUrl = await uploadImageToStorage(file, user.id, i);
            console.log(`✅ Upload successful for image ${i + 1}`);
          } catch (uploadError) {
            console.error(`❌ Upload failed for image ${i + 1}:`, uploadError);
            throw uploadError;
          }

          // OCR phase
          updateResult(i, { status: 'extracting', imageUrl: publicUrl });
          console.log(`🔍 Extracting text from image ${i + 1}...`);
          
          let extractedText;
          try {
            extractedText = await invokeOcrFunction(publicUrl);
            console.log(`✅ Text extraction successful for image ${i + 1}`);
          } catch (ocrError) {
            console.error(`❌ OCR failed for image ${i + 1}:`, ocrError);
            throw ocrError;
          }

          const result: SuccessfulUploadResult = {
            file,
            status: 'completed',
            imageUrl: publicUrl,
            extractedText
          };
          updateResult(i, result);
          finalResults.push(result);
          successCount++;
          
          console.log(`✅ Image ${i + 1} processed successfully`);

        } catch (error) {
          console.error(`❌ Error processing image ${i + 1}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          
          const errorResult: ImageUploadResult = {
            file,
            status: 'error',
            error: errorMessage
          };
          updateResult(i, errorResult);
          finalResults.push(errorResult);
        }
      }

      const successfulResults = finalResults.filter(
        (r): r is SuccessfulUploadResult => r.status === 'completed'
      );
      
      console.log(`📊 Processing finished. Successes: ${successfulResults.length}/${files.length}`);

      if (successfulResults.length === 0) {
        throw new Error('No images were processed successfully. Please check your internet connection and try again.');
      }

      // Save to database
      let uploadRecord;
      try {
        uploadRecord = await saveUploadRecord(user.id, successfulResults);
        console.log('✅ Database save successful');
      } catch (dbError) {
        console.error('❌ Database save failed:', dbError);
        // Don't throw here - the uploads succeeded, just the DB save failed
        toast({
          title: "Partial Success",
          description: `${successfulResults.length} images processed, but failed to save to database. Please try again.`,
          variant: "destructive",
        });
        throw dbError;
      }

      toast({
        title: "Success!",
        description: `${successfulResults.length} of ${files.length} images processed successfully.`,
      });

      console.log('=== ✅ MULTIPLE UPLOAD PROCESS COMPLETED ===');
      return uploadRecord;

    } catch (error) {
      console.error('=== ❌ MULTIPLE UPLOAD PROCESS FAILED ===');
      console.error('Error details:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Error processing images.";
      
      // Provide more helpful error messages based on error type
      let userFriendlyMessage = errorMessage;
      if (errorMessage.includes('not authenticated')) {
        userFriendlyMessage = "Please log in and try again.";
      } else if (errorMessage.includes('bucket')) {
        userFriendlyMessage = "Storage configuration issue. Please contact support.";
      } else if (errorMessage.includes('permission')) {
        userFriendlyMessage = "You don't have permission to upload files. Please log in and try again.";
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userFriendlyMessage = "Network error. Please check your connection and try again.";
      }
      
      toast({
        title: "Error",
        description: userFriendlyMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    uploadMultipleImages,
    uploadResults,
    isProcessing,
    resetUpload
  };
};
