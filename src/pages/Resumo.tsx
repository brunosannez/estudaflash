
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSummary } from '@/hooks/useSummary';
import { useAutoFlashcards } from '@/hooks/useAutoFlashcards';
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
  const { generateMindMap, getMindMapByResumoId, loading: isGeneratingMindMap } = useMindMap();
  
  const [resumo, setResumo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingMindMap, setExistingMindMap] = useState<any>(null);
  const [mindMapLoading, setMindMapLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load summary
  useEffect(() => {
    if (!id) {
      setError('ID do resumo não fornecido');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchResumo = async () => {
      if (initialized) return; // Prevent re-fetching
      
      try {
        setLoading(true);
        console.log('📖 Loading summary with ID:', id);
        const data = await getResumoById(id);
        
        if (isMounted) {
          if (data) {
            console.log('✅ Summary loaded:', data.id);
            setResumo(data);
            setError(null);
            setInitialized(true);
          } else {
            console.warn('⚠️ Summary not found');
            setError('Resumo não encontrado');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('❌ Error loading summary:', err);
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
  }, [id, getResumoById, initialized]);

  // Load existing mind map
  useEffect(() => {
    if (!id || !initialized) return;

    let isMounted = true;

    const fetchMindMap = async () => {
      try {
        setMindMapLoading(true);
        console.log('🧠 Checking existing mind map...');
        const mindMap = await getMindMapByResumoId(id);
        
        if (isMounted) {
          setExistingMindMap(mindMap);
          console.log(mindMap ? '✅ Mind map found' : 'ℹ️ No mind map found');
        }
      } catch (err) {
        if (isMounted) {
          console.error('❌ Error fetching mind map:', err);
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
  }, [id, getMindMapByResumoId, initialized]);

  const handleGenerateFlashcards = async () => {
    if (!resumo?.id) return;
    
    try {
      await generateAutoFlashcards(resumo.id, resumo.resumo_gerado);
      navigate('/my-flashcards');
    } catch (error) {
      console.error('Error generating flashcards:', error);
    }
  };

  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!resumo?.id) {
      console.error('❌ Summary ID not available');
      toast.error('ID do resumo não disponível');
      return;
    }
    
    if (isGeneratingQuiz) return;
    
    try {
      setIsGeneratingQuiz(true);
      console.log('🚀 Starting automatic quiz generation for:', resumo.id);
      
      // Import the hook directly to generate quiz
      const { useOptimizedQuizDataLoader } = await import('@/hooks/quiz/useOptimizedQuizDataLoader');
      
      // For now, navigate to quiz page which will handle generation
      navigate(`/quiz/${resumo.id}?autoGenerate=true`);
    } catch (error) {
      console.error('❌ Error starting quiz generation:', error);
      toast.error('Erro ao iniciar geração de quiz');
    } finally {
      setIsGeneratingQuiz(false);
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
      console.error('Error generating mind map:', error);
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
