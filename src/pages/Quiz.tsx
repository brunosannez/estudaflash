
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  
  const [resumo, setResumo] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [hasCheckedData, setHasCheckedData] = useState(false);
  
  const { getResumoById } = useSummary();

  // Check if this is a resume operation
  const sessionId = searchParams.get('session');
  const resumeMode = searchParams.get('resume') === 'true';

  console.log('📍 Quiz page rendered:', { 
    id, 
    sessionId, 
    resumeMode 
  });

  // Load summary and quiz data with bulletproof checks
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        console.error('❌ No summary ID provided');
        toast.error('ID do resumo não fornecido');
        navigate('/my-summaries');
        return;
      }

      if (hasCheckedData && !resumeMode) {
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

        // Check for existing quiz sessions first to prevent duplicates
        const { data: existingSessions, error: sessionError } = await supabase
          .from('quiz_sessions')
          .select('id, status, progress_percentage, current_question_index')
          .eq('resumo_id', id)
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (sessionError) {
          console.error('❌ Error checking existing sessions:', sessionError);
        }

        console.log('📊 Existing sessions found:', existingSessions?.length || 0);

        // Load existing quizzes with enhanced validation
        const { data: existingQuizzes, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('resumo_id', id)
          .not('pergunta', 'is', null)
          .not('alternativas', 'is', null)
          .gte('correta', 0)
          .lte('correta', 4)
          .order('data_criacao', { ascending: true });

        if (quizError) {
          console.error('❌ Error loading quizzes:', quizError);
          throw quizError;
        }

        // Validate quiz structure with bulletproof checks
        const validQuizzes = (existingQuizzes || []).filter(quiz => {
          const isValid = quiz.pergunta && 
                         Array.isArray(quiz.alternativas) && 
                         quiz.alternativas.length === 5 &&
                         Number.isInteger(quiz.correta) &&
                         quiz.correta >= 0 && 
                         quiz.correta <= 4;
          
          if (!isValid) {
            console.warn('❌ Invalid quiz found and filtered out:', quiz.id);
          }
          
          return isValid;
        });

        console.log('📊 Quiz validation results:', {
          total: existingQuizzes?.length || 0,
          valid: validQuizzes.length,
          invalid: (existingQuizzes?.length || 0) - validQuizzes.length
        });

        setQuizzes(validQuizzes);
        setHasCheckedData(true);
        
      } catch (error) {
        console.error('❌ Error loading data:', error);
        toast.error('Erro ao carregar dados do quiz');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, getResumoById, navigate, hasCheckedData, resumeMode]);

  const handleGenerateQuiz = async () => {
    if (!resumo?.resumo_gerado) {
      console.error('❌ No summary content available for quiz generation');
      toast.error('Conteúdo do resumo não disponível');
      return;
    }

    // Check if quiz already exists to prevent duplicates
    if (quizzes.length > 0) {
      console.warn('⚠️ Quiz already exists, preventing duplicate generation');
      toast.warning('Este resumo já possui um quiz!');
      return;
    }

    // Check for active generation to prevent multiple simultaneous requests
    if (generating) {
      console.warn('⚠️ Quiz generation already in progress');
      return;
    }

    setGenerating(true);
    console.log('🚀 Starting controlled quiz generation...');

    try {
      // Double-check for existing quizzes before generation
      const { data: existingCheck } = await supabase
        .from('quizzes')
        .select('id')
        .eq('resumo_id', id)
        .limit(1);

      if (existingCheck && existingCheck.length > 0) {
        console.warn('⚠️ Quiz found during final check, aborting generation');
        toast.warning('Quiz já existe para este resumo!');
        return;
      }

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
      
      // Reload quizzes after successful generation
      setQuizzes(data.questoes);
      setHasCheckedData(false); // Force data reload
      
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
    
    // Navigate to quiz history
    navigate('/quiz-history');
  };

  const handleBack = () => {
    console.log('⬅️ Navigating back to quiz history');
    navigate('/quiz-history');
  };

  // Show loading while initial data loads
  if (isLoading || !hasCheckedData) {
    console.log('⏳ Showing initial loading state');
    return (
      <QuizLoader 
        message="🔍 Carregando dados do quiz..."
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
        description="Criando questões personalizadas (isso pode levar alguns segundos)"
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
        <QuizPlay 
          quiz={quizData} 
          onComplete={handleQuizComplete}
          sessionId={sessionId}
          resumeMode={resumeMode}
        />
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
      hasExistingQuiz={false}
    />
  );
};

export default Quiz;
