
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Upload, 
  Brain, 
  Target, 
  TrendingUp, 
  Activity,
  Calendar,
  Server,
  Database,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface QuickStats {
  totalUsers: number;
  newUsersToday: number;
  totalUploads: number;
  uploadsToday: number;
  totalFlashcards: number;
  flashcardsToday: number;
  totalQuizzes: number;
  quizzesToday: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadQuickStats = async () => {
    try {
      setLoading(true);
      console.log('📊 Carregando estatísticas rápidas...');

      const today = new Date().toISOString().split('T')[0];
      
      // Buscar dados básicos
      const [usersResult, uploadsResult, flashcardsResult, quizzesResult] = await Promise.all([
        supabase.from('uso_usuarios').select('created_at'),
        supabase.from('uploads').select('data_upload'),
        supabase.from('flashcards').select('data_criacao'),
        supabase.from('quiz_sessions').select('created_at')
      ]);

      // Calcular estatísticas
      const totalUsers = usersResult.data?.length || 0;
      const newUsersToday = usersResult.data?.filter(user => 
        user.created_at?.startsWith(today)
      ).length || 0;

      const totalUploads = uploadsResult.data?.length || 0;
      const uploadsToday = uploadsResult.data?.filter(upload => 
        upload.data_upload?.startsWith(today)
      ).length || 0;

      const totalFlashcards = flashcardsResult.data?.length || 0;
      const flashcardsToday = flashcardsResult.data?.filter(flashcard => 
        flashcard.data_criacao?.startsWith(today)
      ).length || 0;

      const totalQuizzes = quizzesResult.data?.length || 0;
      const quizzesToday = quizzesResult.data?.filter(quiz => 
        quiz.created_at?.startsWith(today)
      ).length || 0;

      // Determinar saúde do sistema
      let systemHealth: 'healthy' | 'warning' | 'error' = 'healthy';
      if (usersResult.error || uploadsResult.error || flashcardsResult.error || quizzesResult.error) {
        systemHealth = 'warning';
      }

      setStats({
        totalUsers,
        newUsersToday,
        totalUploads,
        uploadsToday,
        totalFlashcards,
        flashcardsToday,
        totalQuizzes,
        quizzesToday,
        systemHealth
      });

      console.log('✅ Estatísticas carregadas');
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas.",
        variant: "destructive",
      });
      setStats({
        totalUsers: 0,
        newUsersToday: 0,
        totalUploads: 0,
        uploadsToday: 0,
        totalFlashcards: 0,
        flashcardsToday: 0,
        totalQuizzes: 0,
        quizzesToday: 0,
        systemHealth: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuickStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Card className="w-96">
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Carregando dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <p className="text-gray-600 mb-4">Erro ao carregar dashboard.</p>
        <Button onClick={loadQuickStats}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const getHealthBadge = () => {
    switch (stats.systemHealth) {
      case 'healthy':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Sistema Saudável</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Atenção</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Problemas</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Database</span>
              </div>
              {getHealthBadge()}
            </div>
            <div className="text-sm text-gray-600">
              Última verificação: {new Date().toLocaleTimeString('pt-BR')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersToday} hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUploads}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.uploadsToday} hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flashcards</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFlashcards}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.flashcardsToday} hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.quizzesToday} hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={loadQuickStats} className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Atualizar Dados
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.open('/admin/analytics', '_blank')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Ver Relatórios
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                toast({
                  title: "Manutenção",
                  description: "Funcionalidade de limpeza em desenvolvimento.",
                });
              }}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Limpeza DB
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resumo de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Novos usuários:</span>
              <Badge variant="secondary">{stats.newUsersToday}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uploads realizados:</span>
              <Badge variant="secondary">{stats.uploadsToday}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Flashcards criados:</span>
              <Badge variant="secondary">{stats.flashcardsToday}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Quizzes realizados:</span>
              <Badge variant="secondary">{stats.quizzesToday}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
