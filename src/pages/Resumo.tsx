
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSummary } from '@/hooks/useSummary';
import { useAutoFlashcards } from '@/hooks/useAutoFlashcards';
import { useQuiz } from '@/hooks/useQuiz';
import ResumoContent from '@/components/ResumoContent';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Brain, Target } from 'lucide-react';
import PageLayout from '@/components/navigation/PageLayout';

const Resumo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getResumoById } = useSummary();
  const { generateAutoFlashcards, isGenerating: isGeneratingFlashcards } = useAutoFlashcards();
  const { generateQuiz, loading: isGeneratingQuiz } = useQuiz(id || '');
  
  const [resumo, setResumo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResumo = useCallback(async () => {
    if (!id) {
      setError('ID do resumo não fornecido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📖 Carregando resumo com ID:', id);
      const data = await getResumoById(id);
      
      if (data) {
        console.log('✅ Resumo carregado:', data);
        setResumo(data);
        setError(null);
      } else {
        console.warn('⚠️ Resumo não encontrado');
        setError('Resumo não encontrado');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar resumo:', err);
      setError('Erro ao carregar resumo');
    } finally {
      setLoading(false);
    }
  }, [id]); // Removido getResumoById das dependências

  useEffect(() => {
    fetchResumo();
  }, [fetchResumo]);

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
        </div>

        {/* Content */}
        <ResumoContent content={resumo.resumo_gerado} />
      </div>
    </PageLayout>
  );
};

export default Resumo;
