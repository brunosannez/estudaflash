import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Target, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';

interface QuizQuestion {
  pergunta: string;
  alternativas: string[];
  resposta_correta: number;
  explicacao: string;
  resposta_usuario?: number;
  acertou: boolean;
}

interface QuizSessionData {
  id: string;
  quiz_title: string;
  total_questions: number;
  correct_answers: number;
  completion_time_seconds: number;
  created_at: string;
  questions_data: QuizQuestion[];
  resumo_titulo?: string;
}

const QuizHistoryView = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState<QuizSessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      toast.error('ID da sessão não fornecido');
      navigate('/quiz-history');
      return;
    }

    fetchQuizSession();
  }, [sessionId]);

  const fetchQuizSession = async () => {
    try {
      console.log('🔍 Fetching quiz session:', sessionId);
      
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select(`
          *,
          resumos!inner(
            custom_name,
            uploads!inner(
              arquivo_original_nome
            )
          )
        `)
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('❌ Error fetching quiz session:', error);
        throw error;
      }

      if (!data) {
        toast.error('Sessão de quiz não encontrada');
        navigate('/quiz-history');
        return;
      }

      const resumoTitulo = data.resumos?.custom_name || 
                          data.resumos?.uploads?.arquivo_original_nome || 
                          'Resumo sem título';

      // Parse questions_data safely with proper type handling
      let questionsData: QuizQuestion[] = [];
      try {
        if (typeof data.questions_data === 'string') {
          questionsData = JSON.parse(data.questions_data);
        } else if (Array.isArray(data.questions_data)) {
          // Convert from Json type to QuizQuestion[] through unknown
          questionsData = (data.questions_data as unknown) as QuizQuestion[];
        } else {
          console.warn('Invalid questions_data format:', data.questions_data);
          questionsData = [];
        }
      } catch (parseError) {
        console.error('Error parsing questions_data:', parseError);
        questionsData = [];
      }

      const sessionData: QuizSessionData = {
        id: data.id,
        quiz_title: data.quiz_title,
        total_questions: data.total_questions,
        correct_answers: data.correct_answers,
        completion_time_seconds: data.completion_time_seconds || 0,
        created_at: data.created_at,
        questions_data: questionsData,
        resumo_titulo: resumoTitulo
      };

      setQuizData(sessionData);
      console.log('✅ Quiz session loaded:', sessionData);
    } catch (error) {
      console.error('❌ Error loading quiz session:', error);
      toast.error('Erro ao carregar dados do quiz');
      navigate('/quiz-history');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const getAnswerClass = (questionIndex: number, alternativeIndex: number) => {
    const question = quizData?.questions_data[questionIndex];
    if (!question) return '';

    const isCorrectAnswer = alternativeIndex === question.resposta_correta;
    const isUserAnswer = alternativeIndex === question.resposta_usuario;

    if (isCorrectAnswer && isUserAnswer) {
      return 'bg-green-100 border-green-500 text-green-800'; // Correto e selecionado
    } else if (isCorrectAnswer) {
      return 'bg-green-50 border-green-300 text-green-700'; // Correto mas não selecionado
    } else if (isUserAnswer) {
      return 'bg-red-100 border-red-500 text-red-800'; // Incorreto e selecionado
    }
    return 'bg-gray-50 border-gray-200 text-gray-600'; // Nem correto nem selecionado
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Carregando dados do quiz...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!quizData) {
    return (
      <PageLayout>
        <div className="text-center py-20">
          <p className="text-lg text-gray-600">Quiz não encontrado</p>
        </div>
      </PageLayout>
    );
  }

  const percentage = Math.round((quizData.correct_answers / quizData.total_questions) * 100);

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/quiz-history')}
            variant="ghost" 
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Detalhes do Quiz
            </h1>
            <p className="text-gray-600">Revisão completa de questões e respostas</p>
          </div>
        </div>

        {/* Quiz Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-purple-600" />
              {quizData.quiz_title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Target className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-700">{quizData.correct_answers}/{quizData.total_questions}</div>
                <div className="text-sm text-blue-600">Acertos</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-700">{percentage}%</div>
                <div className="text-sm text-green-600">Aproveitamento</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-purple-700">{formatTime(quizData.completion_time_seconds)}</div>
                <div className="text-sm text-purple-600">Tempo</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-700">
                  {new Date(quizData.created_at).toLocaleDateString('pt-BR')}
                </div>
                <div className="text-sm text-gray-600">Data</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              <strong>Arquivo:</strong> {quizData.resumo_titulo}
            </p>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-6">
          {quizData.questions_data.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">Nenhuma questão encontrada para este quiz.</p>
              </CardContent>
            </Card>
          ) : (
            quizData.questions_data.map((question, questionIndex) => (
              <Card key={questionIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    {question.acertou ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    Questão {questionIndex + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-800 font-medium">{question.pergunta}</p>
                  
                  <div className="grid gap-2">
                    {question.alternativas?.map((alternativa, altIndex) => (
                      <div
                        key={altIndex}
                        className={`p-3 rounded-lg border-2 ${getAnswerClass(questionIndex, altIndex)}`}
                      >
                        <span className="font-medium">{String.fromCharCode(65 + altIndex)}) </span>
                        {alternativa}
                        {altIndex === question.resposta_correta && (
                          <span className="ml-2 text-green-600 font-bold">✓ Correta</span>
                        )}
                        {altIndex === question.resposta_usuario && altIndex !== question.resposta_correta && (
                          <span className="ml-2 text-red-600 font-bold">✗ Sua resposta</span>
                        )}
                      </div>
                    )) || (
                      <p className="text-gray-500 italic">Alternativas não disponíveis</p>
                    )}
                  </div>

                  {question.explicacao && (
                    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">💡 Explicação:</h4>
                      <p className="text-blue-700">{question.explicacao}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default QuizHistoryView;
