
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, Loader2, Home, Brain, TestTube } from 'lucide-react';
import { useSummary } from '@/hooks/useSummary';
import { useNavigate } from 'react-router-dom';
import ImageGallery from './ImageGallery';

interface ExtractedTextDisplayProps {
  uploadData: any;
  onGenerateSummary: () => void;
}

const ExtractedTextDisplay = ({ uploadData, onGenerateSummary }: ExtractedTextDisplayProps) => {
  const { generateSummary, isGenerating } = useSummary();
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  const navigate = useNavigate();

  const handleGenerateSummary = async () => {
    try {
      const result = await generateSummary(uploadData.id, uploadData.texto_extraido || '');
      if (result) {
        setSummaryGenerated(true);
        // Navegar para a página do resumo após 2 segundos
        setTimeout(() => {
          navigate(`/resumo/${uploadData.id}`);
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
            <p className="text-gray-600 mb-4">
              Agora você pode gerar um resumo didático do conteúdo extraído das imagens.
            </p>
            
            {!summaryGenerated ? (
              <Button
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Gerando Resumo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Gerar Resumo Didático
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="text-green-600 font-semibold">
                  ✅ Resumo gerado com sucesso!
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => navigate(`/resumo/${uploadData.id}`)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Resumo
                  </Button>
                  <Button
                    onClick={() => navigate('/meus-flashcards')}
                    variant="outline"
                    className="border-green-300 hover:bg-green-50"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Estudar Flashcards
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Início
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtractedTextDisplay;
