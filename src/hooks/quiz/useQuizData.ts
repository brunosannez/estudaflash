
import { useState, useEffect } from 'react';
import { useQuiz } from '@/hooks/useQuiz';
import { useSummary } from '@/hooks/useSummary';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useQuizData = (resumoId: string | undefined) => {
  const navigate = useNavigate();
  const [resumo, setResumo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizData, setQuizData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { getResumoById } = useSummary();
  const { fetchQuizzes, generateQuiz } = useQuiz(resumoId || '');

  // Load resumo and check for existing quiz
  useEffect(() => {
    const loadData = async () => {
      if (!resumoId) {
        console.error('❌ ID do resumo não fornecido');
        navigate('/my-summaries');
        return;
      }

      try {
        setIsLoading(true);
        console.log('🔍 Carregando resumo:', resumoId);
        
        const resumoData = await getResumoById(resumoId);
        
        if (!resumoData) {
          console.error('❌ Resumo não encontrado');
          toast.error('Resumo não encontrado');
          navigate('/my-summaries');
          return;
        }
        
        console.log('📄 Resumo carregado:', resumoData);
        setResumo(resumoData);

        // Check for existing quiz
        console.log('🎯 Verificando quiz existente para resumo:', resumoId);
        const quizzes = await fetchQuizzes();
        
        if (quizzes && quizzes.length > 0) {
          console.log('✅ Quiz encontrado com', quizzes.length, 'questões');
          setQuizData({
            resumo_id: resumoId,
            questoes: quizzes,
            titulo: `Quiz - ${quizzes.length} questões`
          });
        } else {
          console.log('❌ Nenhum quiz encontrado');
          setQuizData(null);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        toast.error('Erro ao carregar resumo');
        navigate('/my-summaries');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [resumoId, getResumoById, fetchQuizzes, navigate]);

  const handleGenerateQuiz = async () => {
    if (!resumo) {
      toast.error('Resumo não carregado');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🚀 Gerando quiz...');
      const success = await generateQuiz(resumo.resumo_gerado);
      
      if (success) {
        console.log('✅ Quiz gerado, recarregando dados...');
        
        // Aguardar um pouco e recarregar
        setTimeout(async () => {
          try {
            const newQuizzes = await fetchQuizzes();
            console.log('🔄 Quizzes recarregados:', newQuizzes?.length || 0);
            
            if (newQuizzes && newQuizzes.length > 0) {
              setQuizData({
                resumo_id: resumoId,
                questoes: newQuizzes,
                titulo: `Quiz - ${newQuizzes.length} questões`
              });
              toast.success('Quiz gerado com sucesso!');
            } else {
              console.error('❌ Nenhum quiz encontrado após geração');
              toast.error('Quiz gerado mas não foi possível carregá-lo');
            }
          } catch (error) {
            console.error('❌ Erro ao recarregar quiz:', error);
            toast.error('Erro ao carregar quiz gerado');
          } finally {
            setIsGenerating(false);
          }
        }, 2000);
      } else {
        toast.error('Erro ao gerar quiz');
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('❌ Erro ao gerar quiz:', error);
      toast.error('Erro ao gerar quiz');
      setIsGenerating(false);
    }
  };

  const handleQuizComplete = (result: any) => {
    console.log('🏆 Quiz completado:', result);
    toast.success('Quiz concluído!');
  };

  return {
    resumo,
    quizData,
    isLoading,
    isGenerating,
    handleGenerateQuiz,
    handleQuizComplete
  };
};
