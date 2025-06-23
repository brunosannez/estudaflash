
import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { useMindMap } from "@/hooks/useMindMap";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

interface ResumoMindMapButtonProps {
  resumoId: string;
  resumoContent: string;
  resumoTitulo: string;
}

const ResumoMindMapButton = ({ resumoId, resumoContent, resumoTitulo }: ResumoMindMapButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateMindMap, getMindMapByResumoId } = useMindMap();
  const navigate = useNavigate();

  const handleGenerateMindMap = useCallback(async () => {
    if (isGenerating) return;
    
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
  }, [resumoId, resumoContent, generateMindMap, getMindMapByResumoId, navigate, isGenerating]);

  return (
    <Button
      onClick={handleGenerateMindMap}
      disabled={isGenerating}
      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white disabled:opacity-70"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Brain className="h-4 w-4 mr-2" />
          Gerar Mapa Mental
        </>
      )}
    </Button>
  );
};

export default ResumoMindMapButton;
