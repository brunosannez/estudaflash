import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Brain, Info, TrendingUp, Calendar, Trash2 } from 'lucide-react';
import { useFlashcardSetStats } from '@/hooks/useFlashcardSetStats';
import { useContentDeletion } from '@/hooks/useContentDeletion';
import FlashcardStatsTooltip from '@/components/flashcard-study/FlashcardStatsTooltip';

interface FlashcardSet {
  resumo_id: string;
  resumo_title: string;
  data_criacao: string;
  flashcards: any[];
}

interface EnhancedFlashcardSetCardProps {
  flashcardSet: FlashcardSet;
  onStartStudy: (flashcardSet: FlashcardSet, sessionId?: string) => void;
  onDelete?: () => void;
}

const EnhancedFlashcardSetCard = ({ flashcardSet, onStartStudy, onDelete }: EnhancedFlashcardSetCardProps) => {
  const { loadStatsForSet, getStatsForSet, loading } = useFlashcardSetStats();
  const { deleteMultipleFlashcards, isDeleting } = useContentDeletion();
  const [showStats, setShowStats] = useState(false);
  const stats = getStatsForSet(flashcardSet.resumo_id);

  useEffect(() => {
    loadStatsForSet(flashcardSet.resumo_id);
  }, [flashcardSet.resumo_id]);

  const handleDeleteFlashcardSet = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const confirmMessage = `Tem certeza que deseja excluir todos os flashcards de "${flashcardSet.resumo_title}"?\n\nEsta ação irá deletar permanentemente ${flashcardSet.flashcards.length} flashcards e suas revisões.\n\nEsta ação não pode ser desfeita.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    const flashcardIds = flashcardSet.flashcards.map(card => card.id);
    const success = await deleteMultipleFlashcards(flashcardIds);
    
    if (success && onDelete) {
      onDelete();
    }
  };

  const getAccuracyBadge = () => {
    if (!stats || stats.total_cards_reviewed === 0) {
      return <Badge variant="outline" className="text-gray-500">Não estudado</Badge>;
    }

    const accuracy = stats.accuracy_percentage;
    if (accuracy >= 90) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">🌟 {accuracy.toFixed(0)}%</Badge>;
    }
    if (accuracy >= 75) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">👍 {accuracy.toFixed(0)}%</Badge>;
    }
    if (accuracy >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">📚 {accuracy.toFixed(0)}%</Badge>;
    }
    return <Badge className="bg-orange-100 text-orange-800 border-orange-300">🔄 {accuracy.toFixed(0)}%</Badge>;
  };

  const getStudyStreak = () => {
    if (!stats || stats.study_streak === 0) return null;
    return (
      <div className="flex items-center gap-1 text-sm">
        <span>🔥</span>
        <span className="font-medium">{stats.study_streak} dias</span>
      </div>
    );
  };

  const getLastStudiedInfo = () => {
    if (!stats || !stats.last_studied_at) return null;
    
    const lastStudied = new Date(stats.last_studied_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastStudied.getTime()) / (1000 * 60 * 60 * 24));
    
    let text = '';
    let color = 'text-gray-600';
    
    if (diffDays === 0) {
      text = 'Estudado hoje';
      color = 'text-green-600';
    } else if (diffDays === 1) {
      text = 'Estudado ontem';
      color = 'text-blue-600';
    } else if (diffDays < 7) {
      text = `${diffDays} dias atrás`;
      color = 'text-yellow-600';
    } else {
      text = lastStudied.toLocaleDateString('pt-BR');
      color = 'text-orange-600';
    }

    return (
      <div className={`flex items-center gap-1 text-xs ${color}`}>
        <Calendar className="h-3 w-3" />
        <span>{text}</span>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Card 
        className="border-4 border-blue-200 shadow-xl overflow-hidden hover:shadow-2xl hover:border-purple-300 transition-all duration-300 transform hover:scale-105 relative"
      >
        {/* Indicador de Performance e Botão Delete */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          {stats && stats.total_cards_reviewed > 0 && getAccuracyBadge()}
          {onDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteFlashcardSet}
                  className="h-7 w-7 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 opacity-70 hover:opacity-100"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Excluir todos os flashcards</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-3">
          <CardTitle className="text-lg font-bold text-gray-800 line-clamp-2 pr-24">
            {flashcardSet.resumo_title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              {flashcardSet.flashcards.length} cards
            </span>
            <span>
              {new Date(flashcardSet.data_criacao).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short'
              })}
            </span>
          </div>

          {/* Estatísticas Rápidas */}
          {stats && stats.total_cards_reviewed > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Progresso:</span>
                <div className="flex items-center gap-2">
                  {getStudyStreak()}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowStats(!showStats);
                        }}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Ver estatísticas detalhadas</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              {getLastStudiedInfo()}
              
              <div className="text-xs text-gray-600">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                {stats.completed_sessions} sessões completas
              </div>
            </div>
          )}

          {/* Tooltip de Estatísticas */}
          {showStats && stats && (
            <div className="absolute z-50 -top-2 left-full ml-2">
              <FlashcardStatsTooltip stats={stats} />
            </div>
          )}

          {/* Informação sobre novo conjunto */}
          {(!stats || stats.total_cards_reviewed === 0) && (
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg">
              <p className="text-sm text-gray-700 font-medium">
                💡 {flashcardSet.flashcards.length} conceitos prontos para revisar
              </p>
            </div>
          )}
          
          <Button 
            onClick={() => onStartStudy(flashcardSet)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
          >
            <Brain className="h-4 w-4 mr-2" />
            {stats && stats.total_cards_reviewed > 0 ? '🔄 Estudar Novamente' : '🚀 Estudar Agora'}
          </Button>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default EnhancedFlashcardSetCard;