
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Home, CheckCircle } from 'lucide-react';
import { useSummary } from '@/hooks/useSummary';
import { useNavigate } from 'react-router-dom';
import ImageGallery from './ImageGallery';

interface ExtractedTextDisplayProps {
  uploadData: any;
}

const ExtractedTextDisplay = ({ uploadData }: ExtractedTextDisplayProps) => {
  const { generateSummary, isGenerating } = useSummary();
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  const [generatedResumoId, setGeneratedResumoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGenerateSummary = async () => {
    if (!uploadData?.id || !uploadData?.texto_extraido) {
      setError('Dados de upload inválidos');
      return;
    }

    try {
      setError(null);
      console.log('🎯 Iniciando geração de resumo para upload:', uploadData.id);
      
      const result = await generateSummary(uploadData.id, uploadData.texto_extraido);
      
      if (result?.id) {
        setSummaryGenerated(true);
        setGeneratedResumoId(result.id);
        console.log('✅ Resumo gerado com ID:', result.id);
        
        // Navegar após um breve delay para mostrar o sucesso
        setTimeout(() => {
          navigate(`/resumo/${result.id}`);
        }, 2000);
      } else {
        throw new Error('ID do resumo não retornado');
      }
    } catch (error) {
      console.error('❌ Erro no componente ao gerar resumo:', error);
      setError(error.message || 'Erro desconhecido na geração');
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
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
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
        <CardHeader className="bg-muted/50">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            Texto Extraído
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-foreground/80 leading-relaxed">
              {uploadData.texto_extraido || 'Nenhum texto foi extraído.'}
            </pre>
          </div>
          
          <div className="mt-6 text-center">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {!summaryGenerated && !isGenerating && (
              <>
                <p className="text-muted-foreground mb-6">
                  Agora você pode gerar um resumo didático personalizado para o ENEM e vestibulares do Ari de Sá:
                </p>
                
                <div className="max-w-md mx-auto">
                  <Button
                    onClick={handleGenerateSummary}
                    disabled={isGenerating || !uploadData?.texto_extraido}
                    className="bg-emerald-600 hover:opacity-90 text-white shadow-lg w-full"
                    size="lg"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Gerar Resumo Didático
                  </Button>
                </div>
              </>
            )}

            {isGenerating && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-lg font-semibold text-primary">
                    Gerando seu resumo personalizado...
                  </span>
                </div>
                <div className="text-muted-foreground text-sm">
                  <p>📚 Analisando o conteúdo com foco no ENEM e vestibulares</p>
                  <p>🎯 Criando resumo didático no estilo Ari de Sá</p>
                  <p>⚡ Isso pode levar alguns segundos...</p>
                </div>
              </div>
            )}

            {summaryGenerated && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  <span className="text-lg font-semibold">
                    Resumo gerado com sucesso!
                  </span>
                </div>
                <div className="text-muted-foreground text-sm">
                  <p>✅ Resumo otimizado para ENEM e vestibulares</p>
                  <p>🧠 Pronto para gerar flashcards e quiz</p>
                  <p>🚀 Redirecionando...</p>
                </div>
                {generatedResumoId && (
                  <Button
                    onClick={() => navigate(`/resumo/${generatedResumoId}`)}
                    className="bg-primary hover:bg-primary/90 w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Resumo Agora
                  </Button>
                )}
              </div>
            )}

            {/* Botão de voltar ao início */}
            {(summaryGenerated || error) && (
              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Voltar ao Início
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
