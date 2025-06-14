
import { Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MAX_IMAGES = 5;

interface DropzoneProps {
  onFileButtonClick: () => void;
  isProcessing: boolean;
}

const Dropzone = ({ onFileButtonClick, isProcessing }: DropzoneProps) => {
  return (
    <>
      <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        Envie suas imagens de estudo
      </h3>
      <p className="text-gray-500 mb-2">
        Arraste e solte até {MAX_IMAGES} imagens ou clique para selecionar
      </p>
      <p className="text-sm text-gray-400 mb-6">
        Todas as imagens serão processadas e o texto será combinado em um único resumo
      </p>
      <Button
        onClick={onFileButtonClick}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        disabled={isProcessing}
      >
        <Image className="h-5 w-5 mr-2" />
        Selecionar Imagens
      </Button>
    </>
  );
};

export default Dropzone;
