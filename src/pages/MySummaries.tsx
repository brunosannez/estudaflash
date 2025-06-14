
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Search, Calendar, Brain, Sparkles, Clock, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';

interface Resumo {
  id: string;
  resumo_gerado: string;
  data_criacao: string;
  uploads: {
    id: string;
    texto_extraido: string;
  };
}

const MySummaries = () => {
  const [resumos, setResumos] = useState<Resumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredResumos = resumos.filter(resumo =>
    resumo.resumo_gerado.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resumo.uploads.texto_extraido?.toLowerCase().includes(searchTerm.toLowerCase())
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
    return Math.ceil(text.length / 1000); // ~1000 chars per minute
  };

  const handleOpenResumo = (uploadId: string) => {
    navigate(`/resumo/${uploadId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Meus Resumos</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Acesse todos os seus resumos criados. Estude, revise e organize seu conhecimento.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar resumos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <FileText className="h-8 w-8" />
                <div>
                  <p className="text-blue-100 text-sm">Total de Resumos</p>
                  <p className="text-2xl font-bold">{resumos.length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-8 w-8" />
                <div>
                  <p className="text-green-100 text-sm">Tempo Total de Leitura</p>
                  <p className="text-2xl font-bold">
                    {resumos.reduce((total, resumo) => total + getReadingTime(resumo.resumo_gerado), 0)} min
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <Brain className="h-8 w-8" />
                <div>
                  <p className="text-purple-100 text-sm">Conteúdo Processado</p>
                  <p className="text-2xl font-bold">
                    {(resumos.reduce((total, resumo) => total + resumo.resumo_gerado.length, 0) / 1000).toFixed(0)}k chars
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumos list */}
          {filteredResumos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchTerm ? 'Nenhum resumo encontrado' : 'Nenhum resumo criado'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? 'Tente buscar por outros termos.' 
                    : 'Faça upload de uma imagem para criar seu primeiro resumo!'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => navigate('/')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Criar Primeiro Resumo
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResumos.map((resumo) => (
                <Card key={resumo.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">
                        {resumo.uploads.texto_extraido?.slice(0, 50) || 'Resumo'}...
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(resumo.data_criacao)}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {resumo.resumo_gerado.slice(0, 150)}...
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getReadingTime(resumo.resumo_gerado)} min
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {resumo.resumo_gerado.length} chars
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleOpenResumo(resumo.uploads.id)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        size="sm"
                      >
                        Estudar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
};

export default MySummaries;
