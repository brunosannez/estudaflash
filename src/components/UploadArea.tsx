
import { useState, useRef } from 'react';
import { Upload, Image, FileText, Sparkles, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMultipleUpload, ImageUploadResult } from '@/hooks/useMultipleUpload';
import ExtractedTextDisplay from './ExtractedTextDisplay';
import AuthGuard from './AuthGuard';
import { useToast } from '@/hooks/use-toast';

const MAX_IMAGES = 5;

const UploadArea = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { uploadMultipleImages, uploadResults, isProcessing, resetUpload } = useMultipleUpload();

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
    
    console.log('🔄 Arquivos soltos (drag & drop):', e.dataTransfer.files.length);
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length === 0) {
      console.error('❌ Nenhum arquivo foi solto');
      toast({
        title: "Erro",
        description: "Nenhum arquivo foi detectado. Tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    handleFiles(files);
  }

  function handleFiles(files: File[]) {
    console.log('🔄 Processando arquivos:', files.length);
    console.log('📁 Detalhes dos arquivos:', files.map(f => ({ 
      name: f.name, 
      type: f.type, 
      size: f.size,
      isImage: f.type.startsWith('image/')
    })));
    
    // Filtrar apenas imagens
    const imageFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        console.warn(`⚠️ Arquivo ${file.name} não é uma imagem (tipo: ${file.type})`);
      }
      return isImage;
    });
    
    if (imageFiles.length === 0) {
      console.error('❌ Nenhuma imagem válida encontrada');
      toast({
        title: "Erro",
        description: "Nenhuma imagem válida foi selecionada. Por favor, selecione arquivos de imagem (JPG, PNG, etc.).",
        variant: "destructive",
      });
      return;
    }
    
    // Limitar a 5 imagens
    const limitedFiles = imageFiles.slice(0, MAX_IMAGES);
    
    if (limitedFiles.length !== imageFiles.length) {
      console.warn(`⚠️ Limitando de ${imageFiles.length} para ${limitedFiles.length} imagens`);
      toast({
        title: "Aviso",
        description: `Apenas as primeiras ${MAX_IMAGES} imagens foram selecionadas.`,
      });
    }
    
    console.log('✅ Imagens válidas selecionadas:', limitedFiles.length);
    setSelectedFiles(limitedFiles);
    
    // Resetar upload results quando novas imagens são selecionadas
    resetUpload();
  }

  function handleFileButtonClick() {
    console.log('🔄 Botão de seleção de arquivo clicado');
    
    if (!fileInputRef.current) {
      console.error('❌ Referência do input de arquivo é nula');
      toast({
        title: "Erro",
        description: "Erro interno. Recarregue a página e tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      fileInputRef.current.click();
      console.log('✅ Input de arquivo acionado');
    } catch (error) {
      console.error('❌ Erro ao acionar input de arquivo:', error);
      toast({
        title: "Erro",
        description: "Erro ao abrir seletor de arquivos.",
        variant: "destructive",
      });
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    console.log('🔄 Input de arquivo alterado');
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      console.warn('⚠️ Nenhum arquivo selecionado no input');
      return;
    }
    
    console.log('📁 Arquivos do input:', files.length);
    handleFiles(Array.from(files));
  }

  async function handleProcessImages() {
    if (selectedFiles.length === 0) {
      console.error('❌ Nenhum arquivo selecionado para processamento');
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma imagem antes de processar.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('🚀 Iniciando processamento de', selectedFiles.length, 'imagens');
    
    try {
      const result = await uploadMultipleImages(selectedFiles);
      console.log('✅ Upload concluído com sucesso:', result);
      setUploadResult(result);
      setSelectedFiles([]);
      
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Sucesso!",
        description: "Imagens processadas com sucesso!",
      });
    } catch (error) {
      console.error('❌ Erro no processamento das imagens:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido no processamento",
        variant: "destructive",
      });
    }
  }

  function handleGenerateSummary() {
    console.log('📝 Gerar resumo para:', uploadResult);
  }

  function resetAllUploads() {
    console.log('🔄 Resetando todos os uploads');
    setSelectedFiles([]);
    setUploadResult(null);
    resetUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function removeFile(index: number) {
    console.log('🗑️ Removendo arquivo no índice:', index);
    setSelectedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      console.log('📁 Arquivos restantes:', newFiles.length);
      return newFiles;
    });
  }

  function handleChooseOther() {
    console.log('🔄 Escolher outros arquivos');
    setSelectedFiles([]);
    resetUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  // Renderizar status de uma imagem individual
  function renderImageStatus(result: ImageUploadResult) {
    switch (result.status) {
      case 'pending':
        return <div className="absolute top-2 right-2 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>;
      case 'uploading':
        return <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        </div>;
      case 'extracting':
        return <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>;
      case 'completed':
        return <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>;
      case 'error':
        return <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-white" />
        </div>;
    }
  }

  // Debug: log current state
  console.log('🖼️ Estado atual - selectedFiles:', selectedFiles.length, 'uploadResults:', uploadResults.length, 'isProcessing:', isProcessing);

  // Se já tem resultado, mostrar o texto extraído
  if (uploadResult) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Resultado do Upload</h2>
          <Button variant="outline" onClick={resetAllUploads}>
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
              {selectedFiles.length === 0 && uploadResults.length === 0 ? (
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={isProcessing}
                  />
                  <Button 
                    onClick={handleFileButtonClick}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isProcessing}
                  >
                    <Image className="h-5 w-5 mr-2" />
                    Selecionar Imagens
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Preview das imagens selecionadas ou em processamento */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {(selectedFiles.length > 0 ? selectedFiles : uploadResults.map(r => r.file)).map((file, index) => {
                      const result = uploadResults[index];
                      
                      // Criar URL do objeto de forma segura
                      let imageUrl = '';
                      try {
                        imageUrl = URL.createObjectURL(file);
                        console.log(`🖼️ URL criada para imagem ${index + 1}:`, file.name);
                      } catch (error) {
                        console.error(`❌ Erro ao criar URL para imagem ${index + 1}:`, error);
                        return (
                          <div key={`error-${file.name}-${index}`} className="relative">
                            <div className="w-full h-24 bg-red-100 border border-red-300 rounded-lg flex items-center justify-center">
                              <span className="text-red-600 text-xs">Erro ao carregar</span>
                            </div>
                            <p className="text-xs text-red-600 mt-1">{file.name}</p>
                          </div>
                        );
                      }
                      
                      return (
                        <div key={`${file.name}-${index}-${file.size}`} className="relative">
                          <div className="relative rounded-lg overflow-hidden border">
                            <img 
                              src={imageUrl} 
                              alt={`Preview ${index + 1}`} 
                              className="w-full h-24 object-cover"
                              onLoad={() => console.log(`✅ Imagem ${index + 1} carregada:`, file.name)}
                              onError={(e) => {
                                console.error(`❌ Erro ao carregar imagem ${index + 1}:`, file.name, e);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            {selectedFiles.length > 0 && !isProcessing && (
                              <button
                                onClick={() => removeFile(index)}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                disabled={isProcessing}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                            {result && renderImageStatus(result)}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                          {result?.error && (
                            <p className="text-xs text-red-600 mt-1">{result.error}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        onClick={handleProcessImages}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        size="lg"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Processando {selectedFiles.length} imagens...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Extrair Texto de {selectedFiles.length} imagem{selectedFiles.length > 1 ? 's' : ''}
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleChooseOther}
                        disabled={isProcessing}
                      >
                        Escolher Outras
                      </Button>
                    </div>
                  )}

                  {selectedFiles.length < MAX_IMAGES && selectedFiles.length > 0 && !isProcessing && (
                    <div className="border-t pt-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          console.log('🔄 Adicionando mais arquivos...');
                          if (e.target.files && e.target.files.length > 0) {
                            const newFiles = Array.from(e.target.files);
                            const currentCount = selectedFiles.length;
                            const availableSlots = MAX_IMAGES - currentCount;
                            const filesToAdd = newFiles.slice(0, availableSlots);
                            
                            console.log(`➕ Adicionando ${filesToAdd.length} arquivos (${currentCount}/${MAX_IMAGES})`);
                            setSelectedFiles(prev => [...prev, ...filesToAdd]);
                          }
                          // Reset input
                          e.target.value = '';
                        }}
                        className="hidden"
                        id="additional-files"
                      />
                      <Button 
                        variant="outline"
                        onClick={() => {
                          console.log('🔄 Botão adicionar mais imagens clicado');
                          document.getElementById('additional-files')?.click();
                        }}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Adicionar mais imagens ({selectedFiles.length}/{MAX_IMAGES})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Como funciona com múltiplas imagens:</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2">1</div>
                <p>Selecione até {MAX_IMAGES} imagens do seu material de estudo</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mb-2">2</div>
                <p>Google Vision OCR extrai texto de cada imagem</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mb-2">3</div>
                <p>Os textos são combinados em um documento único</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mb-2">4</div>
                <p>Gere resumos e flashcards do conteúdo completo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
};

export default UploadArea;
