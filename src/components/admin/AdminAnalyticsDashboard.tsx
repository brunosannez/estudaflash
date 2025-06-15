
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Upload, 
  Brain, 
  Target, 
  TrendingUp, 
  Calendar,
  FileText,
  Activity,
  BarChart3,
  Loader2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface SystemStats {
  totalUsers: number;
  totalUploads: number;
  totalFlashcards: number;
  totalQuizzes: number;
  totalStorage: number;
  activeUsersToday: number;
  planDistribution: { plan: string; count: number }[];
  activityData: { date: string; uploads: number; flashcards: number; quizzes: number }[];
}

const AdminAnalyticsDashboard = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      console.log('📊 Carregando estatísticas do sistema...');

      // Buscar estatísticas básicas
      const [usersResult, uploadsResult, flashcardsResult, quizzesResult, storageResult, planResult] = await Promise.all([
        supabase.from('uso_usuarios').select('*'),
        supabase.from('uploads').select('id, file_size, data_upload'),
        supabase.from('flashcards').select('id, data_criacao'),
        supabase.from('quiz_sessions').select('id, created_at'),
        supabase.rpc('get_user_storage_usage', { user_uuid: '00000000-0000-0000-0000-000000000000' }).single(),
        supabase.from('uso_usuarios').select('plano')
      ]);

      if (usersResult.error) console.error('Erro ao buscar usuários:', usersResult.error);
      if (uploadsResult.error) console.error('Erro ao buscar uploads:', uploadsResult.error);
      if (flashcardsResult.error) console.error('Erro ao buscar flashcards:', flashcardsResult.error);
      if (quizzesResult.error) console.error('Erro ao buscar quizzes:', quizzesResult.error);
      if (planResult.error) console.error('Erro ao buscar planos:', planResult.error);

      // Calcular estatísticas
      const totalUsers = usersResult.data?.length || 0;
      const totalUploads = uploadsResult.data?.length || 0;
      const totalFlashcards = flashcardsResult.data?.length || 0;
      const totalQuizzes = quizzesResult.data?.length || 0;
      
      // Calcular storage total (soma de todos os file_size)
      const totalStorage = uploadsResult.data?.reduce((acc, upload) => acc + (upload.file_size || 0), 0) || 0;

      // Usuários ativos hoje (que fizeram upload hoje)
      const today = new Date().toISOString().split('T')[0];
      const activeUsersToday = uploadsResult.data?.filter(upload => 
        upload.data_upload?.startsWith(today)
      ).length || 0;

      // Distribuição de planos
      const planCounts = planResult.data?.reduce((acc: Record<string, number>, user) => {
        acc[user.plano] = (acc[user.plano] || 0) + 1;
        return acc;
      }, {}) || {};

      const planDistribution = Object.entries(planCounts).map(([plan, count]) => ({
        plan: plan === 'free' ? 'Gratuito' : plan === 'pro' ? 'Pro' : 'Educacional',
        count: count as number
      }));

      // Dados de atividade dos últimos 7 dias
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const activityData = last7Days.map(date => {
        const uploads = uploadsResult.data?.filter(upload => 
          upload.data_upload?.startsWith(date)
        ).length || 0;
        
        const flashcards = flashcardsResult.data?.filter(flashcard => 
          flashcard.data_criacao?.startsWith(date)
        ).length || 0;
        
        const quizzes = quizzesResult.data?.filter(quiz => 
          quiz.created_at?.startsWith(date)
        ).length || 0;

        return {
          date: new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          uploads,
          flashcards,
          quizzes
        };
      });

      setStats({
        totalUsers,
        totalUploads,
        totalFlashcards,
        totalQuizzes,
        totalStorage,
        activeUsersToday,
        planDistribution,
        activityData
      });

      console.log('✅ Estatísticas carregadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas do sistema.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-96">
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Carregando analytics...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Não foi possível carregar as estatísticas.</p>
        <Button onClick={loadSystemStats}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="space-y-6">
      {/* Cartões de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsersToday} ativos hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUploads}</div>
            <p className="text-xs text-muted-foreground">
              {(stats.totalStorage / (1024 * 1024)).toFixed(1)} MB armazenados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flashcards Criados</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFlashcards}</div>
            <p className="text-xs text-muted-foreground">
              Total no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Realizados</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              Sessões de quiz
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Atividade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade dos Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="uploads" stroke="#8884d8" name="Uploads" />
                <Line type="monotone" dataKey="flashcards" stroke="#82ca9d" name="Flashcards" />
                <Line type="monotone" dataKey="quizzes" stroke="#ffc658" name="Quizzes" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Distribuição de Planos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição de Planos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ações de Refresh */}
      <div className="flex justify-end">
        <Button onClick={loadSystemStats} variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Atualizar Dados
        </Button>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
