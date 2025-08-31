import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { EnemObjectiveQuestion } from './EnemObjectiveQuestion';
import { EnemVFQuestion } from './EnemVFQuestion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface EnemQuestion {
  id: string;
  tipo: 'objetiva' | 'vf_sequencial';
  enunciado: string;
  stem?: string | null;
  statements?: any;
  options: any;
  correct_index: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cognitive_level: 'remember' | 'understand' | 'apply' | 'analyze';
  evidence: string;
}

interface EnemQuizPlayerProps {
  quizMetadataId: string;
  onComplete: (results: any) => void;
  onExit: () => void;
}

export const EnemQuizPlayer: React.FC<EnemQuizPlayerProps> = ({
  quizMetadataId,
  onComplete,
  onExit
}) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<EnemQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load questions and create session
  useEffect(() => {
    const loadQuiz = async () => {
      if (!user) return;

      try {
        // Load questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('enem_questions')
          .select('*')
          .eq('quiz_metadata_id', quizMetadataId)
          .order('created_at');

        if (questionsError) {
          throw new Error(`Failed to load questions: ${questionsError.message}`);
        }

        if (!questionsData || questionsData.length === 0) {
          throw new Error('No questions found');
        }

        setQuestions(questionsData as EnemQuestion[]);
        setUserAnswers(new Array(questionsData.length).fill(-1));

        // Create session
        const { data: sessionData, error: sessionError } = await supabase
          .from('enem_quiz_sessions')
          .insert({
            user_id: user.id,
            quiz_metadata_id: quizMetadataId,
            total_questions: questionsData.length
          })
          .select()
          .single();

        if (sessionError) {
          throw new Error(`Failed to create session: ${sessionError.message}`);
        }

        setSessionId(sessionData.id);
        console.log('✅ Quiz loaded:', questionsData.length, 'questions');

      } catch (error) {
        console.error('❌ Error loading quiz:', error);
        toast.error('Erro ao carregar quiz');
        onExit();
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizMetadataId, user, onExit]);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const finishQuiz = async () => {
    if (!sessionId || !user) return;

    try {
      // Calculate score
      let correctCount = 0;
      const answerPromises = [];

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const userAnswer = userAnswers[i];
        const isCorrect = userAnswer === question.correct_index;
        
        if (isCorrect) correctCount++;

        // Save user answer
        answerPromises.push(
          supabase.from('enem_user_answers').insert({
            session_id: sessionId,
            question_id: question.id,
            user_id: user.id,
            selected_answer: userAnswer,
            is_correct: isCorrect
          })
        );
      }

      await Promise.all(answerPromises);

      // Update session
      await supabase
        .from('enem_quiz_sessions')
        .update({
          score: correctCount,
          status: 'completed',
          completed_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      setShowResults(true);

      const results = {
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        score: Math.round((correctCount / questions.length) * 100),
        timeElapsed,
        sessionId
      };

      onComplete(results);

    } catch (error) {
      console.error('❌ Error finishing quiz:', error);
      toast.error('Erro ao finalizar quiz');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'hard': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando quiz ENEM...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quiz não encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar as questões do quiz.
            </p>
            <Button onClick={onExit}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const correctCount = userAnswers.filter((answer, index) => answer === questions[index].correct_index).length;
    const percentage = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Quiz ENEM Concluído!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-lg bg-primary/5">
                <div className="text-2xl font-bold text-primary">{correctCount}</div>
                <div className="text-sm text-muted-foreground">Acertos</div>
              </div>
              <div className="p-4 rounded-lg bg-primary/5">
                <div className="text-2xl font-bold text-primary">{questions.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="p-4 rounded-lg bg-primary/5">
                <div className="text-2xl font-bold text-primary">{percentage}%</div>
                <div className="text-sm text-muted-foreground">Aproveitamento</div>
              </div>
              <div className="p-4 rounded-lg bg-primary/5">
                <div className="text-2xl font-bold text-primary">{formatTime(timeElapsed)}</div>
                <div className="text-sm text-muted-foreground">Tempo</div>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={onExit} size="lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Finalizar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredQuestions = userAnswers.filter(answer => answer !== -1).length;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={onExit}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Sair
            </Button>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatTime(timeElapsed)}
              </Badge>
              <Badge variant="secondary">
                {currentIndex + 1} de {questions.length}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso do Quiz</span>
              <span>{answeredQuestions}/{questions.length} respondidas</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Questão {currentIndex + 1}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                  {currentQuestion.difficulty === 'easy' ? 'Fácil' : 
                   currentQuestion.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                </Badge>
                <Badge variant="outline">
                  {currentQuestion.tipo === 'objetiva' ? 'Múltipla Escolha' : 'V/F Sequencial'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentQuestion.tipo === 'objetiva' ? (
              <EnemObjectiveQuestion
                question={currentQuestion}
                selectedAnswer={userAnswers[currentIndex]}
                onAnswerSelect={handleAnswerSelect}
              />
            ) : (
              <EnemVFQuestion
                question={currentQuestion}
                selectedAnswer={userAnswers[currentIndex]}
                onAnswerSelect={handleAnswerSelect}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={userAnswers[currentIndex] === -1}
          >
            {currentIndex === questions.length - 1 ? 'Finalizar Quiz' : 'Próxima'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};