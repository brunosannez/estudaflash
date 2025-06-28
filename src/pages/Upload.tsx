
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { designColors } from '@/utils/designSystem';
import PageLayout from '@/components/navigation/PageLayout';
import UploadPreview from '@/components/upload/UploadPreview';
import UploadActions from '@/components/upload/UploadActions';
import UploadProgress from '@/components/upload/UploadProgress';
import { useUsageValidation } from '@/hooks/useUsageValidation';

const Upload = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { checkCanProceed, incrementUsage } = useUsageValidation();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxFiles: 5,
  });

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleChooseOther = () => {
    setSelectedFiles([]);
  };

  const handleAddMoreFiles = (files: File[]) => {
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const handleProcessImages = async () => {
    console.log('🚀 Starting image processing...');
    
    // Verificar limite antes de processar
    const canProceed = await checkCanProceed('uploads');
    if (!canProceed) {
      console.log('❌ Upload blocked by usage limit');
      return;
    }

    if (!selectedFiles.length) {
      toast.error("Nenhuma imagem selecionada", {
        description: "Por favor, selecione pelo menos uma imagem.",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `resumos/${fileName}`;

        console.log(`⬆️ Uploading image ${index + 1}/${selectedFiles.length}:`, file.name);

        const { error: uploadError } = await supabase.storage
          .from('estuda-flash')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('❌ Upload error:', uploadError);
          throw uploadError;
        }

        const { data: imageUrl } = supabase.storage
          .from('estuda-flash')
          .getPublicUrl(filePath);

        console.log(`✅ Image ${index + 1} uploaded successfully:`, imageUrl.publicUrl);
        setProgress((prevProgress) => prevProgress + (100 / selectedFiles.length));
        return imageUrl.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      console.log('📚 All images uploaded successfully:', uploadedUrls);

      // Incrementar uso após sucesso
      await incrementUsage('uploads');
      console.log('✅ Upload usage incremented');

      toast.success("Imagens enviadas com sucesso!", {
        description: "Redirecionando para a página de resumo...",
      });
      
      // Redirecionar para a página de resumo com os URLs das imagens
      setTimeout(() => {
        navigate('/my-summaries');
      }, 2000);
    } catch (error) {
      console.error('❌ Error processing images:', error);
      toast.error("Erro ao enviar imagens", {
        description: "Por favor, tente novamente.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageLayout>
      <div className={`min-h-screen ${designColors.backgrounds.main} relative overflow-hidden`}>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Envie suas imagens para criar um resumo!
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Área de Upload */}
            <div
              {...getRootProps()}
              className={`
                flex flex-col items-center justify-center
                p-6 border-2 border-dashed rounded-2xl cursor-pointer
                ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'}
                transition-colors duration-300
                shadow-md hover:shadow-lg
              `}
            >
              <input {...getInputProps()} />
              <svg
                className="w-12 h-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6M14 13l-3 3m0 0l-3-3m3 3V3"
                ></path>
              </svg>
              <p className="text-gray-500 text-sm">
                Arraste e solte as imagens aqui ou clique para selecionar
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Apenas imagens são permitidas (máx. 5)
              </p>
            </div>

            {/* Área de Pré-visualização */}
            <div>
              {selectedFiles.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedFiles.map((file, index) => (
                      <UploadPreview
                        key={index}
                        file={file}
                        index={index}
                        onRemove={handleRemoveFile}
                      />
                    ))}
                  </div>
                  <UploadActions
                    selectedFiles={selectedFiles}
                    onProcessImages={handleProcessImages}
                    isProcessing={isProcessing}
                    onChooseOther={handleChooseOther}
                    onAddMoreFiles={handleAddMoreFiles}
                  />
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
                  <p className="text-gray-600 text-center">
                    Nenhuma imagem selecionada ainda.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Barra de Progresso */}
          {isProcessing && <UploadProgress progress={progress} />}
        </div>
      </div>
    </PageLayout>
  );
};

export default Upload;
