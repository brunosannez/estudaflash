
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt?: string;
}

const ImageGallery = ({ images, alt = "Imagem carregada" }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openModal = (index: number) => {
    setSelectedIndex(index);
  };

  const closeModal = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Imagens Processadas ({images.length})
        </h3>
        
        {/* Grid de miniaturas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group cursor-pointer rounded-lg overflow-hidden border border-border hover:border-blue-400 transition-all duration-200 hover:shadow-lg"
              onClick={() => openModal(index)}
            >
              <div className="aspect-square">
                <img
                  src={imageUrl}
                  alt={`${alt} ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>
              
              {/* Overlay com ícone de zoom */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              
              {/* Número da imagem */}
              <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para visualização expandida */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>Imagem {selectedIndex !== null ? selectedIndex + 1 : ''} de {images.length}</span>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative">
            {selectedIndex !== null && (
              <div className="flex items-center justify-center p-4">
                <img
                  src={images[selectedIndex]}
                  alt={`${alt} ${selectedIndex + 1}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>
            )}
            
            {/* Navegação */}
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/90 hover:bg-card"
                  onClick={goToPrevious}
                  disabled={selectedIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/90 hover:bg-card"
                  onClick={goToNext}
                  disabled={selectedIndex === images.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          
          {/* Indicadores de página */}
          {images.length > 1 && (
            <div className="flex justify-center space-x-2 p-4">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === selectedIndex ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  onClick={() => setSelectedIndex(index)}
                />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;
