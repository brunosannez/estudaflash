import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSummary } from '@/hooks/useSummary';
import { useAutoFlashcards } from '@/hooks/useAutoFlashcards';
import { useQuiz } from '@/hooks/useQuiz';
import { useMindMap } from '@/hooks/useMindMap';
import { toast } from 'sonner';
import ResumoLoadingState from '@/components/resumo/ResumoLoadingState';
import ResumoErrorState from '@/components/resumo/ResumoErrorState';
import ResumoPageContent from '@/components/resumo/ResumoPageContent';

const Resumo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getResumoById } = useSummary();
  const { generateAutoFlashcards, isGenerating: isGeneratingFlashcards } = useAutoFlashcards();
  const { generateQuiz, loading: isGeneratingQuiz } = useQuiz(id || '');
  const { generateMindMap, getMindMapByResumoId, loading: isGeneratingMindMap } = useMindMap();
  
  const [resumo, setResumo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingMindMap, setExistingMindMap] = useState<any>(null);
  const [mindMapLoading, setMindMapLoading] = useState(false);

  // Carregar resumo - usando apenas 'id' como dependência
  useEffect(() => {
    if (!id) {
      setError('ID do resumo não fornecido');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchResumo = async () => {
      try {
        setLoading(true);
        console.log('📖 Carregando resumo com ID:', id);
        const data = await getResumoById(id);
        
        if (isMounted) {
          if (data) {
            console.log('✅ Resumo carregado:', data);
            setResumo(data);
            setError(null);
          } else {
            console.warn('⚠️ Resumo não encontrado');
            setError('Resumo não encontrado');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('❌ Erro ao carregar resumo:', err);
          setError('Erro ao carregar resumo');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResumo();

    return () => {
      isMounted = false;
    };
  }, [id]); // APENAS 'id' como dependência

  // Carregar mapa mental existente - usando apenas 'id' como dependência
  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchMindMap = async () => {
      try {
        setMindMapLoading(true);
        console.log('🧠 Verificando mapa mental existente...');
        const mindMap = await getMindMapByResumoId(id);
        
        if (isMounted) {
          setExistingMindMap(mindMap);
          console.log(mindMap ? '✅ Mapa mental encontrado' : 'ℹ️ Nenhum mapa mental encontrado');
        }
      } catch (err) {
        if (isMounted) {
          console.error('❌ Erro ao buscar mapa mental:', err);
        }
      } finally {
        if (isMounted) {
          setMindMapLoading(false);
        }
      }
    };

    fetchMindMap();

    return () => {
      isMounted = false;
    };
  }, [id]); // APENAS 'id' como dependência

  const handleGenerateFlashcards = async () => {
    if (!resumo?.id) return;
    
    try {
      await generateAutoFlashcards(resumo.id, resumo.resumo_gerado);
      navigate('/my-flashcards');
    } catch (error) {
      console.error('Erro ao gerar flashcards:', error);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!resumo?.resumo_gerado || !resumo?.id) {
      console.error('❌ Dados do resumo não disponíveis');
      toast.error('Dados do resumo não disponíveis');
      return;
    }
    
    try {
      console.log('🚀 Iniciando geração de quiz para resumo:', resumo.id);
      const success = await generateQuiz(resumo.resumo_gerado);
      
      if (success) {
        console.log('✅ Quiz gerado com sucesso, navegando para quiz');
        toast.success('Quiz gerado com sucesso!');
        // Navegar para a página do quiz
        navigate(`/quiz/${resumo.id}`);
      } else {
        console.error('❌ Falha ao gerar quiz');
        toast.error('Erro ao gerar quiz');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar quiz:', error);
      toast.error('Erro ao gerar quiz');
    }
  };

  const handleGenerateMindMap = async () => {
    if (!resumo?.resumo_gerado || !resumo?.id) return;
    
    try {
      const mindMap = await generateMindMap(resumo.id, resumo.resumo_gerado);
      if (mindMap) {
        navigate(`/mind-map/${mindMap.id}`);
      }
    } catch (error) {
      console.error('Erro ao gerar mapa mental:', error);
    }
  };

  const handleViewMindMap = () => {
    if (existingMindMap) {
      navigate(`/mind-map/${existingMindMap.id}`);
    }
  };

  // Loading state
  if (loading) {
    return <ResumoLoadingState />;
  }

  // Error state
  if (error || !resumo) {
    return <ResumoErrorState error={error} />;
  }

  // Main content
  return (
    <ResumoPageContent
      resumo={resumo}
      existingMindMap={existingMindMap}
      mindMapLoading={mindMapLoading}
      isGeneratingFlashcards={isGeneratingFlashcards}
      isGeneratingQuiz={isGeneratingQuiz}
      isGeneratingMindMap={isGeneratingMindMap}
      onGenerateFlashcards={handleGenerateFlashcards}
      onGenerateQuiz={handleGenerateQuiz}
      onGenerateMindMap={handleGenerateMindMap}
      onViewMindMap={handleViewMindMap}
    />
  );
};

export default Resumo;
