
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, Loader2 } from 'lucide-react';
import { useSummary } from '@/hooks/useSummary';
import { useNavigate } from 'react-router-dom';

interface ExtractedTextDisplayProps {
  uploadData: {
    id: string;
    imagem_url: string;
    texto_extraido: string;
    data_upload: string;
  };
  onGenerateSummary: () => void;
}

const ExtractedTextDisplay = ({ uploadData, onGenerateSummary }: ExtractedTextDisplayProps) => {
  const { generateSummary, isGenerating } = useSummary();
  const navigate = useNavigate();

  const handleGenerateSummary = async () => {
    try {
      const resumo = await generateSummary(uploadData.id, uploadData.texto_extraido);
      if (resumo) {
        navigate(`/resumo/${uploadData.id}`);
      }
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Texto Extraído da Imagem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Imagem Original:</h4>
              <img 
                src={uploadData.imagem_url} 
                alt="Imagem enviada" 
                className="w-full h-48 object-cover rounded-lg border"
              />
            </div>
            <div>
              <h4 className="font-medium mb-2">Texto Detectado:</h4>
              <div className="h-48 p-3 bg-gray-50 rounded-lg border overflow-y-auto">
                {uploadData.texto_extraido ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {uploadData.texto_extraido}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Nenhum texto foi detectado na imagem.
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {uploadData.texto_extraido && (
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleGenerateSummary}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                size="lg"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Gerando Resumo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Gerar Resumo com IA
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtractedTextDisplay;
