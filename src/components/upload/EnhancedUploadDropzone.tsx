import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Upload, FileArchive, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedUploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
  disabled?: boolean;
}

const EnhancedUploadDropzone: React.FC<EnhancedUploadDropzoneProps> = ({
  onFilesSelected,
  isProcessing,
  disabled = false
}) => {
  const validateFile = useCallback((file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedZipTypes = ['application/zip', 'application/x-zip-compressed'];

    // Verificar tamanho
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`Arquivo muito grande: ${file.name}`, {
        description: `Tamanho: ${sizeMB}MB. Máximo permitido: 10MB.`
      });
      return false;
    }

    // Verificar tipo
    const isImage = allowedImageTypes.includes(file.type.toLowerCase());
    const isZip = allowedZipTypes.includes(file.type.toLowerCase()) || file.name.toLowerCase().endsWith('.zip');

    if (!isImage && !isZip) {
      toast.error(`Tipo de arquivo não suportado: ${file.name}`, {
        description: 'Apenas imagens (JPG, PNG, WebP, GIF) e arquivos ZIP são aceitos.'
      });
      return false;
    }

    return true;
  }, []);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log('📁 Files dropped:', { accepted: acceptedFiles.length, rejected: rejectedFiles.length });
    
    // Log rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      console.warn('❌ Rejected file:', file.name, errors);
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          toast.error(`Arquivo muito grande: ${file.name}`, {
            description: 'Máximo: 10MB por arquivo.'
          });
        } else if (error.code === 'file-invalid-type') {
          toast.error(`Tipo não suportado: ${file.name}`, {
            description: 'Use imagens (JPG, PNG, WebP, GIF) ou ZIP.'
          });
        } else {
          toast.error(`Erro no arquivo: ${file.name}`, {
            description: error.message
          });
        }
      });
    });

    // Validar arquivos aceitos
    const validFiles = acceptedFiles.filter(validateFile);
    
    if (validFiles.length > 0) {
      console.log('✅ Valid files to process:', validFiles.length);
      onFilesSelected(validFiles);
    }
  }, [validateFile, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: disabled || isProcessing,
    multiple: true
  });

  const getDropzoneStyle = () => {
    if (disabled || isProcessing) {
      return 'border-input bg-muted/50 cursor-not-allowed';
    }
    if (isDragReject) {
      return 'border-red-500 bg-red-50';
    }
    if (isDragActive) {
      return 'border-blue-500 bg-primary/5 scale-[1.02]';
    }
    return 'border-input bg-card hover:border-blue-400 hover:bg-primary/5/50';
  };

  const getMessage = () => {
    if (disabled || isProcessing) {
      return 'Processando arquivos...';
    }
    if (isDragReject) {
      return 'Alguns arquivos não são suportados';
    }
    if (isDragActive) {
      return 'Solte os arquivos aqui';
    }
    return 'Arraste arquivos aqui ou clique para selecionar';
  };

  const getIcon = () => {
    if (isDragReject) {
      return <AlertCircle className="w-12 h-12 text-red-400" />;
    }
    return <Upload className="w-12 h-12 text-muted-foreground/70" />;
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div
        {...getRootProps()}
        className={`
          min-h-[200px] p-8 border-2 border-dashed rounded-lg transition-all duration-300
          flex flex-col items-center justify-center text-center space-y-4
          ${getDropzoneStyle()}
        `}
      >
        <input {...getInputProps()} />
        
        {getIcon()}
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground/80">
            {getMessage()}
          </p>
          <p className="text-sm text-muted-foreground">
            Máximo: 10 imagens ou 1 arquivo ZIP • Até 10MB por arquivo
          </p>
        </div>

        <div className="flex space-x-6 mt-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            <span>Imagens</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <FileArchive className="w-5 h-5 text-primary" />
            <span>Arquivos ZIP</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedUploadDropzone;