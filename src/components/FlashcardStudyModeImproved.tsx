
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
import { designColors } from '@/utils/designSystem';

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
  const { toast } = useToast();

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
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
  };

  const handleAnswer = async (remembered: boolean) => {
    if (flashcards.length === 0) return;

    const currentCard = flashcards[currentIndex];
    
    try {
      // Registrar review no banco
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('flashcard_reviews').insert({
          flashcard_id: currentCard.id,
          user_id: user.id,
          lembrou: remembered
        });
      }

      // Atualizar estatísticas locais
      const newStats = {
        ...studyStats,
        totalReviewed: studyStats.totalReviewed + 1,
        streak: remembered ? studyStats.streak + 1 : 0,
        xpEarned: studyStats.xpEarned + (remembered ? 10 : 5)
      };

      setStudyStats(newStats);
      setScore(prev => ({
        correct: remembered ? prev.correct + 1 : prev.correct,
        incorrect: remembered ? prev.incorrect : prev.incorrect + 1
      }));

      setCompletedCards(prev => new Set([...prev, currentCard.id]));

      // Feedback visual
      toast({
        title: remembered ? "🎉 Excelente!" : "💪 Continue tentando!",
        description: remembered 
          ? `+10 XP! Sequência: ${newStats.streak}` 
          : "+5 XP por tentar! Você está aprendendo!",
      });

      // Avançar para próximo card
      setTimeout(() => {
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Reiniciar do começo se chegou ao fim
          setCurrentIndex(0);
        }
        setShowAnswer(false);
        setIsFlipped(false);
      }, 1500);

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
      <Card className={designColors.cards.primary}>
        <CardContent className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            📚 Nenhum flashcard disponível
          </h3>
          <p className="text-gray-600 mb-6">
            Este resumo ainda não possui flashcards. Gere alguns para começar a estudar!
          </p>
          <Button onClick={onBack} className={designColors.buttons.primary}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentCard = getCurrentCard();

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 mx-auto mb-2" />
            <p className="text-purple-100 text-sm">XP Ganho</p>
            <p className="text-2xl font-bold">{studyStats.xpEarned}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2" />
            <p className="text-green-100 text-sm">Acertos</p>
            <p className="text-2xl font-bold">{score.correct}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2" />
            <p className="text-blue-100 text-sm">Sequência</p>
            <p className={`text-2xl font-bold ${getStreakColor()}`}>{studyStats.streak}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2" />
            <p className="text-cyan-100 text-sm">Revisados</p>
            <p className="text-2xl font-bold">{studyStats.totalReviewed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              📊 Progresso do Estudo
            </span>
            <span className="text-sm text-gray-500">
              {currentIndex + 1} de {flashcards.length}
            </span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">
              {completedCards.size} cards completados
            </span>
            <span className="text-xs text-gray-500">
              {Math.round(getProgressPercentage())}% concluído
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Flashcard Principal */}
      <div className="relative">
        <Card className={`flashcard-container ${isFlipped ? 'flipped' : ''} shadow-2xl border-0 overflow-hidden`}>
          <div className="flashcard-front">
            <CardContent className="p-8 text-center min-h-[400px] flex flex-col justify-center bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Brain className="h-8 w-8 text-purple-600" />
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  🤔 Pergunta {currentIndex + 1}
                </Badge>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-relaxed">
                {currentCard.pergunta}
              </h2>
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleFlip}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all"
                >
                  🔄 Ver Resposta
                </Button>
              </div>
            </CardContent>
          </div>

          <div className="flashcard-back">
            <CardContent className="p-8 text-center min-h-[400px] flex flex-col justify-center bg-gradient-to-br from-green-50 to-cyan-50">
              <div className="flex items-center justify-center gap-2 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <Badge variant="secondary" className="text-lg px-4 py-2 bg-green-100 text-green-800">
                  💡 Resposta
                </Badge>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-relaxed">
                {currentCard.resposta}
              </h2>
              
              {currentCard.exemplo && (
                <div className="bg-white/50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-2">📝 Exemplo:</p>
                  <p className="text-gray-700 italic">{currentCard.exemplo}</p>
                </div>
              )}
              
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  size="lg"
                  className="border-red-200 text-red-600 hover:bg-red-50 font-bold py-4 px-6 rounded-xl"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  😅 Não Lembrei
                </Button>
                <Button
                  onClick={() => handleAnswer(true)}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  🎉 Acertei!
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Controles */}
      <div className="flex justify-center gap-4">
        <Button onClick={onBack} variant="outline" className="font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" />
          ⬅️ Voltar
        </Button>
        
        <Button onClick={handleShuffle} variant="outline" className="font-medium">
          <Shuffle className="h-4 w-4 mr-2" />
          🎲 Embaralhar
        </Button>
        
        <Button 
          onClick={handleFlip} 
          variant="outline"
          className="font-medium"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          🔄 Virar Card
        </Button>
      </div>
    </div>
  );
};

export default FlashcardStudyModeImproved;
