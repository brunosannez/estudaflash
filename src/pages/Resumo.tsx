
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSummary } from '@/hooks/useSummary';
import { useAutoFlashcards } from '@/hooks/useAutoFlashcards';
import { useQuiz } from '@/hooks/useQuiz';
import { useMindMap } from '@/hooks/useMindMap';
import ResumoContent from '@/components/ResumoContent';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Brain, Target, Lightbulb } from 'lucide-react';
import PageLayout from '@/components/navigation/PageLayout';

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
    if (!resumo?.resumo_gerado) return;
    
    try {
      const success = await generateQuiz(resumo.resumo_gerado);
      if (success) {
        navigate(`/quiz/${resumo.id}`);
      }
    } catch (error) {
      console.error('Erro ao gerar quiz:', error);
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

  // Loading state - mostrar enquanto carrega resumo
  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-96">
            <CardContent className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando resumo...</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (error || !resumo) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-96">
            <CardContent className="py-8 text-center">
              <p className="text-red-600 mb-4">{error || 'Resumo não encontrado'}</p>
              <Button onClick={() => navigate('/my-summaries')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Resumos
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/my-summaries')} 
            variant="ghost" 
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {resumo.custom_name || 'Resumo'}
            </h1>
            <p className="text-gray-600">
              Criado em {new Date(resumo.data_criacao).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleGenerateFlashcards}
            disabled={isGeneratingFlashcards}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {isGeneratingFlashcards ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Gerar Flashcards
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleGenerateQuiz} 
            variant="outline"
            disabled={isGeneratingQuiz}
          >
            {isGeneratingQuiz ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Fazer Quiz
              </>
            )}
          </Button>

          {/* Mind Map Button */}
          {existingMindMap ? (
            <Button 
              onClick={handleViewMindMap}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={mindMapLoading}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Ver Mapa Mental
            </Button>
          ) : (
            <Button 
              onClick={handleGenerateMindMap}
              disabled={isGeneratingMindMap || mindMapLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isGeneratingMindMap ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : mindMapLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Criar Mapa Mental
                </>
              )}
            </Button>
          )}
        </div>

        {/* Content */}
        <ResumoContent content={resumo.resumo_gerado} />
      </div>
    </PageLayout>
  );
};

export default Resumo;
