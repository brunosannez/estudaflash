import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, BookOpen, Zap, Target, Brain } from 'lucide-react';
import { summaryDataService } from '@/services/summaryDataService';
import { toast } from 'sonner';
import PageLayout from '@/components/navigation/PageLayout';

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
              <Button onClick={() => navigate('/upload')} className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Zap className="h-4 w-4 mr-2" />
                Fazer Upload
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Resumos Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumos.map((resumo) => (
              <Card key={resumo.id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {getResumoTitle(resumo)}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(resumo.data_criacao)}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
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
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="py-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Criar novo resumo</h3>
              <p className="text-muted-foreground">
                Faça upload de uma nova imagem para gerar um resumo didático personalizado
              </p>
              <Button 
                onClick={() => navigate('/upload')} 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600"
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