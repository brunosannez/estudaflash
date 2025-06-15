
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, Loader2, Home, Brain, TestTube } from 'lucide-react';
import { useSummary } from '@/hooks/useSummary';
import { useQuiz } from '@/hooks/useQuiz';
import { useNavigate } from 'react-router-dom';
import ImageGallery from './ImageGallery';

interface ExtractedTextDisplayProps {
  uploadData: any;
  onGenerateSummary: () => void;
  onGenerateQuiz: () => void;
}

const ExtractedTextDisplay = ({ uploadData, onGenerateSummary, onGenerateQuiz }: ExtractedTextDisplayProps) => {
  const { generateSummary, isGenerating: isSummaryGenerating } = useSummary();
  const { generateQuiz, loading: isQuizGenerating } = useQuiz(uploadData.id || '');
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  const [quizGenerated, setQuizGenerated] = useState(false);
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

  const handleGenerateQuiz = async () => {
    try {
      const result = await generateQuiz(uploadData.texto_extraido || '');
      if (result) {
        setQuizGenerated(true);
        // Navegar para a página de quiz após 2 segundos
        setTimeout(() => {
          navigate(`/quiz?resumoId=${uploadData.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao gerar quiz:', error);
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
              Escolha como você quer estudar este conteúdo:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {/* Botão Gerar Resumo */}
              <div className="space-y-4">
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
                  <div className="space-y-3">
                    <div className="text-green-600 font-semibold">
                      ✅ Resumo gerado com sucesso!
                    </div>
                    <Button
                      onClick={() => navigate(`/resumo/${uploadData.id}`)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Resumo
                    </Button>
                  </div>
                )}
              </div>

              {/* Botão Gerar Quiz */}
              <div className="space-y-4">
                {!quizGenerated ? (
                  <Button
                    onClick={handleGenerateQuiz}
                    disabled={isQuizGenerating}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg w-full"
                    size="lg"
                  >
                    {isQuizGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Gerando Quiz...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-5 w-5 mr-2" />
                        Criar Jogos Divertidos!
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="text-orange-600 font-semibold">
                      ✅ Quiz gerado com sucesso!
                    </div>
                    <Button
                      onClick={() => navigate(`/quiz?resumoId=${uploadData.id}`)}
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 w-full"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Jogar Quiz
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Botões de ação adicional após geração */}
            {(summaryGenerated || quizGenerated) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
