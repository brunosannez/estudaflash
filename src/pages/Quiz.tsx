
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';
import QuizPlay from '@/components/QuizPlay';
import QuizLoader from '@/components/quiz/QuizLoader';
import QuizGenerator from '@/components/quiz/QuizGenerator';
import { useQuiz } from '@/hooks/useQuiz';
import { useSummary } from '@/hooks/useSummary';

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [resumo, setResumo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { getResumoById } = useSummary();
  const { quizzes, loading: quizLoading, fetchQuizzes, generateQuiz } = useQuiz(id || '');

  console.log('📍 Quiz page loaded with resumoId:', id);

  // Carregar resumo e quiz
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        console.error('❌ ID do resumo não fornecido');
        navigate('/my-summaries');
        return;
      }

      try {
        setIsLoading(true);
        console.log('🔍 Carregando resumo:', id);
        
        // Carregar resumo
        const resumoData = await getResumoById(id);
        
        if (!resumoData) {
          console.error('❌ Resumo não encontrado');
          toast.error('Resumo não encontrado');
          navigate('/my-summaries');
          return;
        }
        
        console.log('📄 Resumo carregado:', resumoData);
        setResumo(resumoData);

        // Buscar quiz existente
        console.log('🎯 Verificando quiz existente...');
        await fetchQuizzes();
        
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        toast.error('Erro ao carregar resumo');
        navigate('/my-summaries');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, getResumoById, fetchQuizzes, navigate]);

  const handleGenerateQuiz = async () => {
    if (!resumo?.resumo_gerado) {
      toast.error('Resumo não carregado');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🚀 Gerando quiz...');
      const success = await generateQuiz(resumo.resumo_gerado);
      
      if (success) {
        console.log('✅ Quiz gerado, recarregando...');
        // Aguardar um pouco e recarregar
        setTimeout(async () => {
          await fetchQuizzes();
          setIsGenerating(false);
          toast.success('Quiz gerado com sucesso!');
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

  console.log('🎯 Quiz state:', { 
    hasQuizzes: quizzes.length > 0, 
    questionsCount: quizzes.length,
    isLoading, 
    isGenerating,
    quizLoading
  });

  // Loading state
  if (isLoading || quizLoading) {
    console.log('⏳ Showing loading state');
    return (
      <QuizLoader 
        message="🔍 Carregando..."
        description="Verificando quiz disponível"
      />
    );
  }

  // Generating state
  if (isGenerating) {
    console.log('🔄 Showing generating state');
    return (
      <QuizLoader 
        message="🧠 Gerando quiz..."
        description="Criando questões personalizadas"
      />
    );
  }

  // Show quiz if available
  if (quizzes && quizzes.length > 0) {
    console.log('✅ Showing quiz with', quizzes.length, 'questions');
    const quizData = {
      resumo_id: id!,
      questoes: quizzes,
      titulo: `Quiz - ${quizzes.length} questões`
    };
    
    return (
      <PageLayout>
        <QuizPlay quiz={quizData} onComplete={handleQuizComplete} />
      </PageLayout>
    );
  }

  // No quiz - show generation option
  console.log('❌ No quiz found, showing generator');
  return (
    <QuizGenerator 
      resumoId={id}
      onGenerateQuiz={handleGenerateQuiz}
      isGenerating={isGenerating}
    />
  );
};

export default Quiz;
