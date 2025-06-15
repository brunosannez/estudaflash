
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Home } from 'lucide-react';
import { useSummary } from '@/hooks/useSummary';
import { useNavigate } from 'react-router-dom';
import ImageGallery from './ImageGallery';

interface ExtractedTextDisplayProps {
  uploadData: any;
}

const ExtractedTextDisplay = ({ uploadData }: ExtractedTextDisplayProps) => {
  const { generateSummary, isGenerating: isSummaryGenerating } = useSummary();
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  const [generatedResumoId, setGeneratedResumoId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGenerateSummary = async () => {
    try {
      const result = await generateSummary(uploadData.id, uploadData.texto_extraido || '');
      if (result) {
        setSummaryGenerated(true);
        setGeneratedResumoId(result.id);
        // Navegar para a página do resumo usando o ID do resumo gerado
        setTimeout(() => {
          navigate(`/resumo/${result.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
    }
  };

  // Extrair URLs das imagens dos resultados
  const imageUrls = uploadData?.results
    ?.filter((result: any) => result.status === 'completed' && result.imageUrl)
    ?.map((result: any) => result.imageUrl) || [];

  return (
    <div className="space-y-6">
      {/* Galeria de Imagens */}
      {imageUrls.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Imagens Carregadas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ImageGallery images={imageUrls} alt="Imagem de estudo" />
          </CardContent>
        </Card>
      )}

      {/* Texto Extraído */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Texto Extraído
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
              {uploadData.texto_extraido || 'Nenhum texto foi extraído.'}
            </pre>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-6">
              Agora você pode gerar um resumo didático deste conteúdo:
            </p>
            
            <div className="max-w-md mx-auto">
              {/* Botão Gerar Resumo */}
              {!summaryGenerated ? (
                <Button
                  onClick={handleGenerateSummary}
                  disabled={isSummaryGenerating}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg w-full"
                  size="lg"
                >
                  {isSummaryGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Gerando Resumo...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 mr-2" />
                      Gerar Resumo Didático
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="text-green-600 font-semibold text-lg">
                    ✅ Resumo gerado com sucesso!
                  </div>
                  <p className="text-gray-600 text-sm">
                    Redirecionando para o resumo onde você poderá gerar flashcards e quiz...
                  </p>
                  {generatedResumoId && (
                    <Button
                      onClick={() => navigate(`/resumo/${generatedResumoId}`)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Resumo
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Botão de voltar ao início após geração */}
            {summaryGenerated && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Início
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtractedTextDisplay;
