
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, FileText, Brain, Target, Edit3, Save, X, Sparkles, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSummary } from '@/hooks/useSummary';
import { useToast } from '@/hooks/use-toast';
import { useContentDeletion } from '@/hooks/useContentDeletion';
import { designColors } from '@/utils/designSystem';
import PageLayout from '@/components/navigation/PageLayout';

const MySummaries = () => {
  const navigate = useNavigate();
  const { getAllResumos, updateResumoName } = useSummary();
  const { toast } = useToast();
  const { deleteResumo, isDeleting } = useContentDeletion();
  const [resumos, setResumos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    loadResumos();
  }, []);

  const loadResumos = async () => {
    try {
      const data = await getAllResumos();
      console.log('📚 Resumos carregados:', data);
      setResumos(data || []);
    } catch (error) {
      console.error('Erro ao carregar resumos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditName = (resumo: any) => {
    setEditingId(resumo.id);
    setEditingName(resumo.custom_name || getDefaultName(resumo));
  };

  const handleSaveName = async () => {
    if (!editingId) return;
    
    try {
      await updateResumoName(editingId, editingName);
      
      // Atualizar o estado local
      setResumos(prev => prev.map(r => 
        r.id === editingId 
          ? { ...r, custom_name: editingName }
          : r
      ));
      
      setEditingId(null);
      setEditingName('');
      
      toast({
        title: "✅ Nome atualizado!",
        description: "O nome do resumo foi alterado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível atualizar o nome do resumo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteResumo = async (resumo: any) => {
    const resumoName = getDisplayName(resumo);
    const confirmMessage = `Tem certeza que deseja excluir "${resumoName}"?\n\nEsta ação irá deletar permanentemente:\n• O resumo\n• Todos os flashcards relacionados\n• Todos os quizzes relacionados\n\nEsta ação não pode ser desfeita.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    const success = await deleteResumo(resumo.id);
    if (success) {
      // Remove o resumo da lista local
      setResumos(prev => prev.filter(r => r.id !== resumo.id));
    }
  };

  const getDefaultName = (resumo: any) => {
    if (resumo.uploads?.texto_extraido) {
      return resumo.uploads.texto_extraido.slice(0, 50) + '...';
    }
    return `Resumo ${new Date(resumo.data_criacao).toLocaleDateString('pt-BR')}`;
  };

  const getDisplayName = (resumo: any) => {
    return resumo.custom_name || getDefaultName(resumo);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-600">📚 Carregando seus resumos...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showBackground>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Sparkles className="h-12 w-12 text-cyan-500 animate-pulse" />
            <div className="flex items-center gap-3">
              <div className={`w-16 h-16 bg-gradient-to-r from-purple-400 to-cyan-500 rounded-2xl flex items-center justify-center ${designColors.animations.iconFloat}`}>
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Meus Resumos Inteligentes
              </h1>
              <div className="text-5xl animate-bounce">📚</div>
            </div>
            <Sparkles className="h-12 w-12 text-purple-500 animate-pulse" />
          </div>
          
          <div className={`${designColors.cards.accent} p-6 max-w-4xl mx-auto`}>
            <p className="text-xl text-gray-700 font-medium leading-relaxed">
              🎪 Seus resumos organizados e prontos para estudar! Clique em qualquer resumo para explorar, gerar flashcards ou fazer quizzes. ✨
            </p>
          </div>
        </div>

        {resumos.length === 0 ? (
          <Card className={designColors.cards.primary}>
            <CardContent className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                Nenhum resumo encontrado
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Você ainda não possui resumos. Faça upload de suas imagens de estudo para começar!
              </p>
              <Button 
                onClick={() => navigate('/upload')}
                className={designColors.buttons.primary}
                size="lg"
              >
                📤 Fazer Primeiro Upload
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumos.map((resumo) => (
              <Card 
                key={resumo.id} 
                className={`${designColors.cards.primary} ${designColors.animations.cardHover} cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-purple-300`}
                onClick={() => editingId !== resumo.id && navigate(`/resumo/${resumo.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    {editingId === resumo.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveName();
                          }}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                            setEditingName('');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <CardTitle className="text-lg font-bold text-gray-800 flex-1 line-clamp-2">
                          {getDisplayName(resumo)}
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditName(resumo);
                            }}
                            className="opacity-70 hover:opacity-100"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteResumo(resumo);
                            }}
                            className="opacity-70 hover:opacity-100 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(resumo.data_criacao).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {resumo.uploads?.arquivo_original_nome && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span className="truncate">{resumo.uploads.arquivo_original_nome}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                      <FileText className="h-3 w-3 mr-1" />
                      Resumo
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                      <Brain className="h-3 w-3 mr-1" />
                      Flashcards
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                      <Target className="h-3 w-3 mr-1" />
                      Quiz
                    </Badge>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button 
                      className={`w-full ${designColors.buttons.primary} font-medium`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/resumo/${resumo.id}`);
                      }}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      🚀 Estudar Agora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MySummaries;
