
import { useToast } from '@/hooks/use-toast';
import { useMultipleUploadState } from './useMultipleUploadState';
import { useUsageLimit } from './useUsageLimit';
import { useAdvancedBadges } from './useAdvancedBadges';
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
  const { checkCanProceed, incrementUsage } = useUsageLimit();
  const { checkBadgesForActivity } = useAdvancedBadges();
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
      console.log('=== 🚀 STARTING UPLOAD PROCESS ===');
      console.log(`📁 Files to process: ${files.length}`);
      
      // Verificação de limite simplificada
      const canProceed = await checkCanProceed('uploads');
      if (!canProceed) {
        console.log('❌ Upload bloqueado por limite de uso');
        return;
      }
      
      // Validar arquivos
      try {
        validateFiles(files);
        console.log('✅ File validation passed');
      } catch (validationError) {
        console.error('❌ File validation failed:', validationError);
        throw validationError;
      }

      // Verificar autenticação
      let user;
      try {
        user = await verifyUserAndBucket();
        console.log('✅ User and bucket verification passed');
      } catch (authError) {
        console.error('❌ User/bucket verification failed:', authError);
        throw authError;
      }

      initializeResults(files);

      const finalResults: ImageUploadResult[] = [];
      let successCount = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        console.log(`=== 🖼️ PROCESSING IMAGE ${i + 1}/${files.length}: ${file.name} (${fileSizeInMB}MB) ===`);
        
        try {
          // Upload phase
          updateResult(i, { status: 'uploading' });
          console.log(`📤 Uploading image ${i + 1}...`);
          
          const publicUrl = await uploadImageToStorage(file, user.id, i);
          console.log(`✅ Upload successful for image ${i + 1}`);

          // OCR phase
          updateResult(i, { status: 'extracting', imageUrl: publicUrl });
          console.log(`🔍 Extracting text from image ${i + 1}...`);
          
          const extractedText = await invokeOcrFunction(publicUrl, user.id);
          console.log(`✅ Text extraction successful for image ${i + 1}, text length: ${extractedText.length}`);

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
          const errorMessage = error instanceof Error ? error.message : `Erro na imagem ${i + 1}`;
          
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
        throw new Error('Nenhuma imagem foi processada com sucesso. Verifique sua conexão e tente novamente.');
      }

      // Save to database
      let uploadRecord;
      try {
        uploadRecord = await saveUploadRecord(user.id, successfulResults);
        console.log('✅ Database save successful');
        
        // Incrementar contador de uso APENAS após sucesso completo
        await incrementUsage('uploads');
        console.log('✅ Usage counter incremented');
        
        // Verificar badges após upload bem-sucedido
        console.log('🏆 Verificando badges de upload...');
        try {
          await checkBadgesForActivity('upload');
        } catch (badgeError) {
          console.error('Error checking upload badges:', badgeError);
        }
      } catch (dbError) {
        console.error('❌ Database save failed:', dbError);
        // Don't throw here - the uploads succeeded, just the DB save failed
        toast({
          title: "Sucesso Parcial",
          description: `${successfulResults.length} imagens processadas, mas falha ao salvar no banco. Tente novamente.`,
          variant: "destructive",
        });
        throw dbError;
      }

      // Show appropriate success message
      const failureCount = files.length - successfulResults.length;
      if (failureCount > 0) {
        toast({
          title: "Processamento Concluído",
          description: `${successfulResults.length} de ${files.length} imagens processadas com sucesso. ${failureCount} falharam.`,
        });
      } else {
        toast({
          title: "Sucesso!",
          description: `Todas as ${successfulResults.length} imagens foram processadas com sucesso.`,
        });
      }

      console.log('✅ Upload completed successfully');
      return uploadRecord;

    } catch (error) {
      console.error('=== ❌ UPLOAD PROCESS FAILED ===');
      console.error('Error details:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar imagens.";
      
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

  const processMultipleFiles = async (files: File[]) => {
    const result = await uploadMultipleImages(files);
    
    // Convert to format expected by useExpandedUpload
    if (result && result.texto_extraido) {
      const successfulResults: SuccessfulUploadResult[] = files.map((file, index) => ({
        file,
        status: 'completed' as const,
        imageUrl: `${result.imagem_url}_${index}`,
        extractedText: result.texto_extraido || ''
      }));
      
      return {
        success: true,
        data: successfulResults
      };
    }
    
    return {
      success: false,
      data: []
    };
  };

  return {
    uploadMultipleImages,
    processMultipleFiles,
    uploadResults,
    isProcessing,
    resetUpload
  };
};
