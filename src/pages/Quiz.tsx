
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';
import QuizPlay from '@/components/QuizPlay';
import QuizLoader from '@/components/quiz/QuizLoader';
import QuizGenerator from '@/components/quiz/QuizGenerator';
import { useSummary } from '@/hooks/useSummary';
import { supabase } from '@/integrations/supabase/client';

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [resumo, setResumo] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hasCheckedData, setHasCheckedData] = useState(false);
  
  const { getResumoById } = useSummary();

  console.log('📍 Quiz page rendered - ID:', id);

  // Load summary and quiz data
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        console.error('❌ No summary ID provided');
        toast.error('ID do resumo não fornecido');
        navigate('/my-summaries');
        return;
      }

      if (hasCheckedData) {
        console.log('ℹ️ Data already checked, skipping reload');
        return;
      }

      try {
        setIsLoading(true);
        console.log('🔍 Loading summary and quiz data for ID:', id);
        
        // Load summary first
        const resumoData = await getResumoById(id);
        
        if (!resumoData) {
          console.error('❌ Summary not found');
          toast.error('Resumo não encontrado');
          navigate('/my-summaries');
          return;
        }
        
        console.log('📄 Summary loaded successfully');
        setResumo(resumoData);

        // Load existing quizzes
        const { data: existingQuizzes, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('resumo_id', id)
          .order('data_criacao', { ascending: true });

        if (quizError) {
          console.error('❌ Error loading quizzes:', quizError);
          throw quizError;
        }

        console.log('📊 Existing quizzes loaded:', existingQuizzes?.length || 0);
        setQuizzes(existingQuizzes || []);
        
        setHasCheckedData(true);
        
      } catch (error) {
        console.error('❌ Error loading data:', error);
        toast.error('Erro ao carregar dados do quiz');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, getResumoById, navigate, hasCheckedData]);

  const handleGenerateQuiz = async () => {
    if (!resumo?.resumo_gerado) {
      console.error('❌ No summary content available for quiz generation');
      toast.error('Conteúdo do resumo não disponível');
      return;
    }

    setGenerating(true);
    console.log('🚀 Starting quiz generation with edge function...');

    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          resumoContent: resumo.resumo_gerado,
          resumoId: id 
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw error;
      }

      if (!data.success) {
        console.error('❌ Quiz generation failed:', data.error);
        throw new Error(data.error);
      }

      console.log('✅ Quiz generated successfully:', data);
      toast.success(`Quiz gerado com ${data.questoes.length} questões!`);
      
      // Reload quizzes
      setQuizzes(data.questoes);
      
    } catch (error) {
      console.error('❌ Quiz generation error:', error);
      toast.error('Erro ao gerar quiz. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  const handleQuizComplete = (result: any) => {
    console.log('🏆 Quiz completed with result:', result);
    toast.success(`Quiz concluído! Você acertou ${result.correctAnswers} de ${result.totalQuestions} questões.`);
  };

  const handleBack = () => {
    if (id) {
      console.log('⬅️ Navigating back to summary:', id);
      navigate(`/resumo/${id}`);
    } else {
      console.log('⬅️ Navigating back to summaries');
      navigate('/my-summaries');
    }
  };

  // Show loading while initial data loads
  if (isLoading || !hasCheckedData) {
    console.log('⏳ Showing initial loading state');
    return (
      <QuizLoader 
        message="🔍 Carregando dados..."
        description="Verificando quiz e resumo disponível"
      />
    );
  }

  // Show generating state
  if (generating) {
    console.log('🔄 Showing quiz generation state');
    return (
      <QuizLoader 
        message="🧠 Gerando quiz..."
        description="Criando questões personalizadas no estilo ENEM e Colégio Ari de Sá"
      />
    );
  }

  // Show quiz if we have questions
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

  // No quiz found - show generation option
  console.log('❌ No quiz found, showing generator');
  return (
    <QuizGenerator 
      resumoId={id}
      resumoContent={resumo?.resumo_gerado}
      onGenerateQuiz={handleGenerateQuiz}
      isGenerating={generating}
      onBack={handleBack}
    />
  );
};

export default Quiz;
