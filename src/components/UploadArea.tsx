import { useState } from 'react';
import { Upload, Image, FileText, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUpload } from '@/hooks/useUpload';
import ExtractedTextDisplay from './ExtractedTextDisplay';
import AuthGuard from './AuthGuard';

const UploadArea = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  
  const { uploadImageAndExtractText, isUploading, isExtracting } = useUpload();

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }

  function handleFile(file: File) {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }

  async function handleProcessImage() {
    if (!selectedImage) return;
    
    try {
      // Converter URL object para File
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const file = new File([blob], 'uploaded-image.jpg', { type: blob.type });
      
      const result = await uploadImageAndExtractText(file);
      setUploadResult(result);
      setSelectedImage(null);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
    }
  }

  function handleGenerateSummary() {
    // TODO: Implementar geração de resumo
    console.log('Gerar resumo para:', uploadResult);
  }

  function resetUpload() {
    setSelectedImage(null);
    setUploadResult(null);
  }

  // Se já tem resultado, mostrar o texto extraído
  if (uploadResult) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Resultado do Upload</h2>
          <Button variant="outline" onClick={resetUpload}>
            Novo Upload
          </Button>
        </div>
        <ExtractedTextDisplay 
          uploadData={uploadResult} 
          onGenerateSummary={handleGenerateSummary}
        />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!selectedImage ? (
                <>
                  <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Envie sua imagem de estudo
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Arraste e solte uma imagem ou clique para selecionar
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                    disabled={isUploading || isExtracting}
                  />
                  <label htmlFor="file-upload">
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={isUploading || isExtracting}
                    >
                      <Image className="h-5 w-5 mr-2" />
                      Selecionar Imagem
                    </Button>
                  </label>
                </>
              ) : (
                <div className="space-y-4">
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={handleProcessImage}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      size="lg"
                      disabled={isUploading || isExtracting}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : isExtracting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Extraindo Texto...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Extrair Texto com OCR
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedImage(null)}
                      disabled={isUploading || isExtracting}
                    >
                      Escolher Outra
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Como funciona:</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2">1</div>
                <p>Upload da imagem do seu material de estudo</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mb-2">2</div>
                <p>Google Vision OCR extrai o texto da imagem</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mb-2">3</div>
                <p>Visualize o texto e gere resumos com IA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
};

export default UploadArea;
