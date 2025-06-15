
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Search, Calendar, Brain, Sparkles, Clock, BookOpen, Edit2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';
import MainNavigation from '@/components/navigation/MainNavigation';
import { designColors } from '@/utils/designSystem';

interface Resumo {
  id: string;
  resumo_gerado: string;
  data_criacao: string;
  custom_name?: string;
  uploads: {
    id: string;
    texto_extraido: string;
  };
}

const MySummaries = () => {
  const [resumos, setResumos] = useState<Resumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumos();
  }, []);

  const fetchResumos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('resumos')
        .select(`
          id,
          resumo_gerado,
          data_criacao,
          custom_name,
          uploads!inner(
            id,
            texto_extraido,
            user_id
          )
        `)
        .eq('uploads.user_id', user.id)
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      setResumos(data || []);
    } catch (error) {
      console.error('Erro ao buscar resumos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os resumos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateResumoName = async (resumoId: string, customName: string) => {
    try {
      const { error } = await supabase
        .from('resumos')
        .update({ custom_name: customName || null })
        .eq('id', resumoId);

      if (error) throw error;

      setResumos(prev => prev.map(resumo => 
        resumo.id === resumoId 
          ? { ...resumo, custom_name: customName || undefined }
          : resumo
      ));

      toast({
        title: "Sucesso",
        description: "Nome do resumo atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar nome do resumo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o nome do resumo.",
        variant: "destructive",
      });
    }
  };

  const handleEditName = (resumo: Resumo) => {
    setEditingId(resumo.id);
    setEditingName(resumo.custom_name || '');
  };

  const handleSaveName = async (resumoId: string) => {
    await updateResumoName(resumoId, editingName);
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const filteredResumos = resumos.filter(resumo =>
    resumo.resumo_gerado.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resumo.uploads.texto_extraido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resumo.custom_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReadingTime = (text: string) => {
    return Math.ceil(text.length / 1000);
  };

  const handleOpenResumo = (resumoId: string) => {
    navigate(`/resumo/${resumoId}`);
  };

  const getResumoTitle = (resumo: Resumo) => {
    return resumo.custom_name || `Resumo de ${resumo.uploads.texto_extraido?.slice(0, 30)}...` || 'Resumo';
  };

  if (loading) {
    return (
      <AuthGuard>
        <MainNavigation>
          <div className="flex items-center justify-center py-20">
            <div className={`${designColors.cards.primary} p-8 text-center`}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
              <div className="text-2xl font-bold text-gray-700 mb-2">
                🚀 Carregando seus resumos...
              </div>
              <p className="text-gray-600 text-lg">Preparando seu conhecimento!</p>
            </div>
          </div>
        </MainNavigation>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainNavigation>
        <div className="space-y-8 relative overflow-hidden">
          {/* Elementos decorativos flutuantes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 text-4xl animate-bounce opacity-20">📚</div>
            <div className="absolute top-40 right-20 text-3xl animate-pulse opacity-30">✨</div>
            <div className="absolute bottom-20 left-20 text-5xl animate-float opacity-20">📖</div>
            <div className="absolute bottom-40 right-10 text-2xl animate-bounce opacity-25">🌟</div>
          </div>

          <div className={`text-center space-y-4 ${designColors.animations.slideIn} relative z-10`}>
            <div className="flex items-center justify-center gap-4">
              <Sparkles className="h-10 w-10 text-cyan-500 animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-lg flex items-center justify-center animate-pulse">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-cyan-600 bg-clip-text text-transparent">
                  Meus Resumos Incríveis
                </h1>
                <div className="text-4xl animate-bounce">📚</div>
              </div>
              <Sparkles className="h-10 w-10 text-purple-500 animate-pulse" />
            </div>
            <div className={`${designColors.cards.accent} p-4 max-w-2xl mx-auto`}>
              <p className="text-gray-700 text-lg font-medium">
                🎪 Acesse todos os seus resumos criados. Estude, revise e organize seu conhecimento de forma divertida! ✨
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className={`max-w-md mx-auto ${designColors.animations.slideIn} relative z-10`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="🔍 Buscar resumos mágicos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-cyan-200 rounded-xl focus:border-purple-400"
              />
            </div>
          </div>

          {/* Statistics */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${designColors.animations.slideIn} relative z-10`}>
            <Card className={`bg-gradient-to-r from-cyan-400 to-cyan-500 text-white border-0 ${designColors.animations.cardHover}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <FileText className="h-8 w-8" />
                <div>
                  <p className="text-cyan-100 text-sm">📚 Total de Resumos</p>
                  <p className="text-2xl font-bold">{resumos.length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className={`bg-gradient-to-r from-green-400 to-green-500 text-white border-0 ${designColors.animations.cardHover}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-8 w-8" />
                <div>
                  <p className="text-green-100 text-sm">⏱️ Tempo de Leitura</p>
                  <p className="text-2xl font-bold">
                    {resumos.reduce((total, resumo) => total + getReadingTime(resumo.resumo_gerado), 0)} min
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className={`bg-gradient-to-r from-purple-400 to-purple-500 text-white border-0 ${designColors.animations.cardHover}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <Brain className="h-8 w-8" />
                <div>
                  <p className="text-purple-100 text-sm">🧠 Conteúdo Processado</p>
                  <p className="text-2xl font-bold">
                    {(resumos.reduce((total, resumo) => total + resumo.resumo_gerado.length, 0) / 1000).toFixed(0)}k chars
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumos list */}
          {filteredResumos.length === 0 ? (
            <div className={`${designColors.animations.slideIn} relative z-10`}>
              <Card className={designColors.cards.primary}>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">
                    {searchTerm ? '🔍 Nenhum resumo encontrado' : '📖 Nenhum resumo criado ainda'}
                  </h3>
                  <p className="text-gray-600 mb-6 text-lg">
                    {searchTerm 
                      ? '🎯 Tente buscar por outros termos mágicos!' 
                      : '🎪 Faça upload de uma imagem para criar seu primeiro resumo incrível!'
                    }
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => navigate('/upload')}
                      className={`${designColors.buttons.primary} text-white font-bold py-3 px-6 rounded-xl shadow-lg ${designColors.animations.buttonHover}`}
                    >
                      ✨ Criar Primeiro Resumo
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${designColors.animations.slideIn} relative z-10`}>
              {filteredResumos.map((resumo, index) => (
                <div 
                  key={resumo.id}
                  className={designColors.animations.cardHover}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card className={`${designColors.cards.primary} h-full`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {editingId === resumo.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                placeholder="Nome do resumo..."
                                className="text-sm"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveName(resumo.id);
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSaveName(resumo.id)}
                                className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg line-clamp-2 text-gray-700 flex-1">
                                📝 {getResumoTitle(resumo)}
                              </CardTitle>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditName(resumo)}
                                className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <Calendar className="h-4 w-4 text-cyan-500 flex-shrink-0 ml-2" />
                      </div>
                      <p className="text-sm text-gray-500">
                        🗓️ {formatDate(resumo.data_criacao)}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {resumo.resumo_gerado.slice(0, 150)}...
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          ⏱️ {getReadingTime(resumo.resumo_gerado)} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          📊 {resumo.resumo_gerado.length} chars
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleOpenResumo(resumo.id)}
                          className={`flex-1 ${designColors.buttons.primary} text-white font-bold rounded-xl shadow-lg ${designColors.animations.buttonHover}`}
                          size="sm"
                        >
                          🎯 Estudar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </MainNavigation>
    </AuthGuard>
  );
};

export default MySummaries;
