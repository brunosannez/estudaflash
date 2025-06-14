
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
      
      validateFiles(files);
      const user = await verifyUserAndBucket();

      initializeResults(files);

      const finalResults: ImageUploadResult[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`=== 🖼️ PROCESSING IMAGE ${i + 1}/${files.length}: ${file.name} ===`);
        
        try {
          updateResult(i, { status: 'uploading' });
          const publicUrl = await uploadImageToStorage(file, user.id, i);

          updateResult(i, { status: 'extracting', imageUrl: publicUrl });
          const extractedText = await invokeOcrFunction(publicUrl);

          const result: SuccessfulUploadResult = {
            file,
            status: 'completed',
            imageUrl: publicUrl,
            extractedText
          };
          updateResult(i, result);
          finalResults.push(result);

        } catch (error) {
          console.error(`❌ Error processing image ${i + 1}:`, error);
          const errorResult: ImageUploadResult = {
            file,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
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
        throw new Error('No images were processed successfully');
      }

      const uploadRecord = await saveUploadRecord(user.id, successfulResults);

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
      
      toast({
        title: "Error",
        description: errorMessage,
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
