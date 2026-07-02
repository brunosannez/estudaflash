import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, BookOpen, Zap, Target, Brain, Trash2 } from 'lucide-react';
import { summaryDataService } from '@/services/summaryDataService';
import { deleteService } from '@/services/deleteService';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';
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

interface Resumo {
  id: string;
  custom_name: string | null;
  resumo_gerado: string;
  data_criacao: string;
  uploads: {
    id: string;
    arquivo_original_nome: string;
    texto_extraido: string;
    data_upload: string;
  };
}

const MySummaries = () => {
  const navigate = useNavigate();
  const [resumos, setResumos] = useState<Resumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadResumos();
  }, []);

  const loadResumos = async () => {
    try {
      setLoading(true);
      const data = await summaryDataService.getAllResumos();
      setResumos(data);
    } catch (error) {
      console.error('Erro ao carregar resumos:', error);
      toast.error('Erro ao carregar resumos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resumoId: string) => {
    setDeletingId(resumoId);
    const success = await deleteService.deleteResumo(resumoId);
    if (success) {
      setResumos(prev => prev.filter(r => r.id !== resumoId));
    }
    setDeletingId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getResumoTitle = (resumo: Resumo) => {
    return resumo.custom_name || resumo.uploads.arquivo_original_nome || 'Resumo';
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando resumos...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Meus Resumos
          </h1>
          <p className="text-muted-foreground">
            Acesse seus resumos didáticos e gere flashcards ou quizzes
          </p>
        </div>

        {/* Empty State */}
        {resumos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum resumo encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não possui resumos criados. Faça upload de uma imagem para começar!
              </p>
              <Button onClick={() => navigate('/upload')} className="bg-primary">
                <Zap className="h-4 w-4 mr-2" />
                Fazer Upload
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Resumos Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumos.map((resumo) => (
              <Card key={resumo.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 relative">
                {/* Botão de excluir */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 z-10"
                      disabled={deletingId === resumo.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deletar resumo?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação é irreversível. O resumo, flashcards e quizzes relacionados serão permanentemente excluídos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(resumo.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Deletar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between pr-8">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {getResumoTitle(resumo)}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(resumo.data_criacao)}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <FileText className="h-3 w-3 mr-1" />
                      Resumo
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Content Preview */}
                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {resumo.resumo_gerado.slice(0, 150)}...
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={() => navigate(`/resumo/${resumo.id}`)}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Ver Resumo
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/quiz-enem/${resumo.id}`)}
                        className="border-yellow-300 hover:bg-yellow-50 hover:border-yellow-400 text-yellow-700"
                      >
                        <Target className="h-3 w-3 mr-1" />
                        Quiz ENEM
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/resumo/${resumo.id}#flashcards`)}
                        className="border-green-300 hover:bg-green-50 hover:border-green-400 text-green-700"
                      >
                        <Brain className="h-3 w-3 mr-1" />
                        Flashcards
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <Card className="bg-muted/50 border-blue-200">
          <CardContent className="py-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Criar novo resumo</h3>
              <p className="text-muted-foreground">
                Faça upload de uma nova imagem para gerar um resumo didático personalizado
              </p>
              <Button 
                onClick={() => navigate('/upload')} 
                size="lg"
                className="bg-primary"
              >
                <Zap className="h-4 w-4 mr-2" />
                Fazer Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default MySummaries;