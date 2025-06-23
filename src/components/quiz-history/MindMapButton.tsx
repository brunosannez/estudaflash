
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import { useMindMap } from '@/hooks/useMindMap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MindMapButtonProps {
  resumoId: string;
  resumoContent: string;
  resumoTitulo: string;
}

const MindMapButton = ({ resumoId, resumoContent, resumoTitulo }: MindMapButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateMindMap, getMindMapByResumoId } = useMindMap();
  const navigate = useNavigate();

  const handleGenerateMindMap = async () => {
    try {
      setIsGenerating(true);
      console.log('🧠 Starting mind map generation for resumo:', resumoId);

      // Check if mind map already exists
      const existingMindMap = await getMindMapByResumoId(resumoId);
      
      if (existingMindMap) {
        console.log('✅ Mind map already exists, navigating to it');
        toast.success('Mapa mental já existe! Redirecionando...');
        navigate(`/mind-map/${existingMindMap.id}`);
        return;
      }

      // Generate new mind map
      toast.info('Gerando mapa mental... Isso pode levar alguns segundos.');
      const mindMap = await generateMindMap(resumoId, resumoContent);
      
      if (mindMap) {
        console.log('✅ Mind map generated successfully');
        toast.success('Mapa mental gerado com sucesso!');
        navigate(`/mind-map/${mindMap.id}`);
      } else {
        throw new Error('Falha na geração do mapa mental');
      }
    } catch (error) {
      console.error('❌ Error generating mind map:', error);
      toast.error('Erro ao gerar mapa mental. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerateMindMap}
      disabled={isGenerating}
      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Brain className="h-4 w-4 mr-2" />
          Criar Mapa Mental
        </>
      )}
    </Button>
  );
};

export default MindMapButton;
