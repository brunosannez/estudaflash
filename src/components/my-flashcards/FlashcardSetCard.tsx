import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Trash2 } from 'lucide-react';
import { deleteService } from '@/services/deleteService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FlashcardSet {
  resumo_id: string;
  resumo_title: string;
  data_criacao: string;
  flashcards: any[];
}

interface FlashcardSetCardProps {
  flashcardSet: FlashcardSet;
  onStartStudy: (flashcardSet: FlashcardSet, sessionId?: string) => void;
  onDeleted?: () => void;
}

const FlashcardSetCard = ({ flashcardSet, onStartStudy, onDeleted }: FlashcardSetCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deleteService.deleteFlashcardSet(flashcardSet.resumo_id);
    if (success && onDeleted) {
      onDeleted();
    }
    setIsDeleting(false);
  };

  return (
    <Card 
      className="group border-4 border-blue-200 shadow-xl overflow-hidden hover:shadow-2xl hover:border-purple-300 transition-all duration-300 transform hover:scale-105 relative"
    >
      {/* Botão de excluir */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-10"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar flashcards?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Todos os {flashcardSet.flashcards.length} flashcards deste conjunto serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-3 pr-12">
        <CardTitle className="text-lg font-bold text-gray-800 line-clamp-2">
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
        
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg">
          <p className="text-sm text-gray-700 font-medium">
            💡 {flashcardSet.flashcards.length} conceitos prontos para revisar
          </p>
        </div>
        
        <Button 
          onClick={() => onStartStudy(flashcardSet)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
        >
          <Brain className="h-4 w-4 mr-2" />
          🚀 Estudar Agora
        </Button>
      </CardContent>
    </Card>
  );
};

export default FlashcardSetCard;
