
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  Star,
  Target,
  Zap,
  Award,
  TrendingUp,
  ArrowLeft,
  Shuffle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGameification } from '@/hooks/useGameification';
import { designColors } from '@/utils/designSystem';
import './FlashcardAnimations.css';

interface Flashcard {
  id: string;
  pergunta: string;
  resposta: string;
  exemplo?: string;
}

interface FlashcardStudyModeImprovedProps {
  resumoId: string;
  onBack: () => void;
}

const FlashcardStudyModeImproved = ({ resumoId, onBack }: FlashcardStudyModeImprovedProps) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [studyStats, setStudyStats] = useState({ streak: 0, totalReviewed: 0, xpEarned: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();
  const { addXP } = useGameification();

  useEffect(() => {
    fetchFlashcards();
  }, [resumoId]);

  const fetchFlashcards = async () => {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('resumo_id', resumoId)
        .order('data_criacao', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setFlashcards(data);
      } else {
        toast({
          title: "Nenhum flashcard encontrado",
          description: "Este resumo ainda não possui flashcards. Gere alguns primeiro!",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar flashcards:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os flashcards.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsFlipped(!isFlipped);
    
    setTimeout(() => {
      setShowAnswer(!showAnswer);
      setIsAnimating(false);
    }, 300);
  };

  const handleAnswer = async (remembered: boolean) => {
    if (flashcards.length === 0 || isAnimating) return;

    const currentCard = flashcards[currentIndex];
    const xpToAdd = remembered ? 5 : 1;
    
    try {
      // Registrar review no banco
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('flashcard_reviews').insert({
          flashcard_id: currentCard.id,
          user_id: user.id,
          lembrou: remembered
        });

        // Adicionar XP através do sistema de gamificação
        await addXP(xpToAdd, 'flashcard');
      }

      // Atualizar estatísticas locais
      const newStats = {
        ...studyStats,
        totalReviewed: studyStats.totalReviewed + 1,
        streak: remembered ? studyStats.streak + 1 : 0,
        xpEarned: studyStats.xpEarned + xpToAdd
      };

      setStudyStats(newStats);
      setScore(prev => ({
        correct: remembered ? prev.correct + 1 : prev.correct,
        incorrect: remembered ? prev.incorrect : prev.incorrect + 1
      }));

      setCompletedCards(prev => new Set([...prev, currentCard.id]));

      // Feedback visual melhorado
      toast({
        title: remembered ? "🎉 Excelente!" : "💪 Continue tentando!",
        description: remembered 
          ? `+${xpToAdd} XP! Sequência: ${newStats.streak}` 
          : `+${xpToAdd} XP por tentar! Você está aprendendo!`,
      });

      // Avançar para próximo card automaticamente após resposta
      setTimeout(() => {
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Reiniciar do começo se chegou ao fim
          setCurrentIndex(0);
        }
        setShowAnswer(false);
        setIsFlipped(false);
      }, 1500); // Dar tempo para ver o feedback

    } catch (error) {
      console.error('Erro ao registrar review:', error);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsFlipped(false);
    toast({
      title: "🎲 Cards embaralhados!",
      description: "Ordem dos flashcards foi alterada para variar o estudo.",
    });
  };

  const getProgressPercentage = () => {
    if (flashcards.length === 0) return 0;
    return (completedCards.size / flashcards.length) * 100;
  };

  const getCurrentCard = () => {
    return flashcards[currentIndex];
  };

  const getStreakColor = () => {
    if (studyStats.streak >= 10) return "text-purple-600";
    if (studyStats.streak >= 5) return "text-blue-600";
    if (studyStats.streak >= 3) return "text-green-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">🧠 Carregando flashcards mágicos...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Card className="border-4 border-blue-200 shadow-xl overflow-hidden">
        <CardContent className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            📚 Nenhum flashcard disponível
          </h3>
          <p className="text-gray-600 mb-6">
            Este resumo ainda não possui flashcards. Gere alguns para começar a estudar!
          </p>
          <Button onClick={onBack} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentCard = getCurrentCard();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header com estatísticas melhorado */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 mx-auto mb-2" />
            <p className="text-purple-100 text-sm font-medium">XP Ganho</p>
            <p className="text-2xl font-bold">{studyStats.xpEarned}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2" />
            <p className="text-green-100 text-sm font-medium">Acertos</p>
            <p className="text-2xl font-bold">{score.correct}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2" />
            <p className="text-blue-100 text-sm font-medium">Sequência</p>
            <p className={`text-2xl font-bold`} style={{color: 'white'}}>{studyStats.streak}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2" />
            <p className="text-cyan-100 text-sm font-medium">Revisados</p>
            <p className="text-2xl font-bold">{studyStats.totalReviewed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso melhorado */}
      <Card className="border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Progresso do Estudo
            </span>
            <Badge variant="secondary" className="text-sm font-medium">
              {currentIndex + 1} de {flashcards.length}
            </Badge>
          </div>
          <Progress value={getProgressPercentage()} className="h-3 mb-2" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{completedCards.size} cards completados</span>
            <span>{Math.round(getProgressPercentage())}% concluído</span>
          </div>
        </CardContent>
      </Card>

      {/* Flashcard Principal com design melhorado */}
      <div className="relative perspective-1000">
        <div className={`flashcard-container ${isFlipped ? 'flipped' : ''} mx-auto max-w-2xl`}>
          {/* Frente do Card */}
          <Card className="flashcard-front absolute inset-0 w-full h-full border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <CardContent className="h-full flex flex-col justify-center p-8 text-center min-h-[400px]">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <Badge className="text-lg px-4 py-2 bg-purple-100 text-purple-700">
                  🤔 Pergunta {currentIndex + 1}
                </Badge>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-relaxed min-h-[120px] flex items-center justify-center">
                {currentCard.pergunta}
              </h2>
              
              <Button 
                onClick={handleFlip}
                disabled={isAnimating}
                size="lg"
                className="mx-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                🔄 Ver Resposta
              </Button>
            </CardContent>
          </Card>

          {/* Verso do Card */}
          <Card className="flashcard-back absolute inset-0 w-full h-full border-0 shadow-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50">
            <CardContent className="h-full flex flex-col justify-center p-8 text-center min-h-[400px]">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <Badge className="text-lg px-4 py-2 bg-green-100 text-green-700">
                  💡 Resposta
                </Badge>
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-relaxed">
                  {currentCard.resposta}
                </h2>
                
                {currentCard.exemplo && (
                  <div className="bg-white/70 rounded-xl p-4 mb-6 border border-green-200">
                    <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Exemplo:
                    </p>
                    <p className="text-gray-700 italic">{currentCard.exemplo}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 justify-center mt-6">
                <Button
                  onClick={() => handleAnswer(false)}
                  disabled={isAnimating}
                  variant="outline"
                  size="lg"
                  className="border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold py-4 px-6 rounded-xl shadow-md disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  😅 Não Lembrei (+1 XP)
                </Button>
                <Button
                  onClick={() => handleAnswer(true)}
                  disabled={isAnimating}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-md disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  🎉 Acertei! (+5 XP)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controles melhorados */}
      <div className="flex justify-center gap-4 flex-wrap">
        <Button onClick={onBack} variant="outline" className="font-medium shadow-md">
          <ArrowLeft className="h-4 w-4 mr-2" />
          ⬅️ Voltar
        </Button>
        
        <Button onClick={handleShuffle} variant="outline" className="font-medium shadow-md">
          <Shuffle className="h-4 w-4 mr-2" />
          🎲 Embaralhar
        </Button>
        
        <Button 
          onClick={handleFlip} 
          disabled={isAnimating}
          variant="outline"
          className="font-medium shadow-md disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          🔄 Virar Card
        </Button>
      </div>
    </div>
  );
};

export default FlashcardStudyModeImproved;
