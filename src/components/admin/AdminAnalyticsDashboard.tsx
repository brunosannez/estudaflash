
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
  Loader2,
  Download,
  Trophy
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface SystemStats {
  totalUsers: number;
  totalUploads: number;
  totalFlashcards: number;
  totalQuizzes: number;
  totalStorage: number;
  activeUsersToday: number;
  activeUsers7Days: number;
  planDistribution: { plan: string; count: number; percentage: number }[];
  newUsersData: { date: string; count: number }[];
  activityData: { date: string; uploads: number; flashcards: number; quizzes: number }[];
  topUsers: { email: string; totalActivity: number; uploads: number; flashcards: number; quizzes: number }[];
  featureUsage: { feature: string; count: number; percentage: number }[];
}

const AdminAnalyticsDashboard = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      console.log('📊 Carregando estatísticas avançadas do sistema...');

      // Buscar dados básicos
      const [usersResult, uploadsResult, flashcardsResult, quizzesResult] = await Promise.all([
        supabase.from('uso_usuarios').select('*'),
        supabase.from('uploads').select('id, file_size, data_upload, user_id'),
        supabase.from('flashcards').select('id, data_criacao, resumo_id(upload_id(user_id))'),
        supabase.from('enem_quiz_sessions').select('id, started_at, user_id')
      ]);

      if (usersResult.error) console.error('Erro ao buscar usuários:', usersResult.error);
      if (uploadsResult.error) console.error('Erro ao buscar uploads:', uploadsResult.error);
      if (flashcardsResult.error) console.error('Erro ao buscar flashcards:', flashcardsResult.error);
      if (quizzesResult.error) console.error('Erro ao buscar quizzes:', quizzesResult.error);

      const users = usersResult.data || [];
      const uploads = uploadsResult.data || [];
      const flashcards = flashcardsResult.data || [];
      const quizzes = quizzesResult.data || [];

      // Calcular estatísticas básicas
      const totalUsers = users.length;
      const totalUploads = uploads.length;
      const totalFlashcards = flashcards.length;
      const totalQuizzes = quizzes.length;
      const totalStorage = uploads.reduce((acc, upload) => acc + (upload.file_size || 0), 0);

      // Usuários ativos (últimos 7 dias)
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      const activeUsers7Days = new Set(uploads.filter(upload => 
        new Date(upload.data_upload) >= last7Days
      ).map(u => u.user_id)).size;

      // Usuários ativos hoje
      const today = new Date().toISOString().split('T')[0];
      const activeUsersToday = new Set(uploads.filter(upload => 
        upload.data_upload?.startsWith(today)
      ).map(u => u.user_id)).size;

      // Distribuição de planos
      const planCounts = users.reduce((acc: Record<string, number>, user) => {
        acc[user.plano] = (acc[user.plano] || 0) + 1;
        return acc;
      }, {});

      const planDistribution = Object.entries(planCounts).map(([plan, count]) => ({
        plan: plan === 'free' ? 'Gratuito' : plan === 'pro' ? 'Pro' : 'Educacional',
        count: count as number,
        percentage: Math.round((count as number / totalUsers) * 100)
      }));

      // Novos usuários por dia (últimos 7 dias)
      const newUsersData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const count = users.filter(user => 
          user.created_at?.startsWith(dateStr)
        ).length;

        return {
          date: date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          count
        };
      }).reverse();

      // Dados de atividade dos últimos 7 dias
      const activityData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const uploadsCount = uploads.filter(upload => 
          upload.data_upload?.startsWith(dateStr)
        ).length;
        
        const flashcardsCount = flashcards.filter(flashcard => 
          flashcard.data_criacao?.startsWith(dateStr)
        ).length;
        
        const quizzesCount = quizzes.filter(quiz => 
          quiz.started_at?.startsWith(dateStr)
        ).length;

        return {
          date: date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          uploads: uploadsCount,
          flashcards: flashcardsCount,
          quizzes: quizzesCount
        };
      }).reverse();

      // Top usuários da semana
      const userActivity = users.map(user => {
        const userUploads = uploads.filter(u => u.user_id === user.user_id).length;
        const userFlashcards = user.flashcards_gerados || 0;
        const userQuizzes = user.quizzes_realizados || 0;
        
        return {
          email: `user_${user.user_id.slice(0, 8)}`, // Ocultar email real por privacidade
          totalActivity: userUploads + userFlashcards + userQuizzes,
          uploads: userUploads,
          flashcards: userFlashcards,
          quizzes: userQuizzes
        };
      }).sort((a, b) => b.totalActivity - a.totalActivity).slice(0, 5);

      // Uso por funcionalidade
      const totalFeatureUsage = totalUploads + totalFlashcards + totalQuizzes;
      const featureUsage = [
        { 
          feature: 'OCR/Upload', 
          count: totalUploads,
          percentage: Math.round((totalUploads / totalFeatureUsage) * 100)
        },
        { 
          feature: 'Flashcards', 
          count: totalFlashcards,
          percentage: Math.round((totalFlashcards / totalFeatureUsage) * 100)
        },
        { 
          feature: 'Quizzes', 
          count: totalQuizzes,
          percentage: Math.round((totalQuizzes / totalFeatureUsage) * 100)
        }
      ];

      setStats({
        totalUsers,
        totalUploads,
        totalFlashcards,
        totalQuizzes,
        totalStorage,
        activeUsersToday,
        activeUsers7Days,
        planDistribution,
        newUsersData,
        activityData,
        topUsers: userActivity,
        featureUsage
      });

      console.log('✅ Estatísticas avançadas carregadas com sucesso');
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

  const exportWeeklyReport = async () => {
    if (!stats) return;

    const reportData = {
      period: `${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')} - ${new Date().toLocaleDateString('pt-BR')}`,
      totalUsers: stats.totalUsers,
      activeUsers7Days: stats.activeUsers7Days,
      newUsers: stats.newUsersData.reduce((acc, day) => acc + day.count, 0),
      totalUploads: stats.totalUploads,
      totalFlashcards: stats.totalFlashcards,
      totalQuizzes: stats.totalQuizzes,
      storageUsed: `${(stats.totalStorage / (1024 * 1024)).toFixed(1)} MB`,
      planDistribution: stats.planDistribution
    };

    const csvContent = [
      ['Métrica', 'Valor'],
      ['Período', reportData.period],
      ['Total de Usuários', reportData.totalUsers],
      ['Usuários Ativos (7 dias)', reportData.activeUsers7Days],
      ['Novos Usuários', reportData.newUsers],
      ['Total de Uploads', reportData.totalUploads],
      ['Total de Flashcards', reportData.totalFlashcards],
      ['Total de Quizzes', reportData.totalQuizzes],
      ['Armazenamento Usado', reportData.storageUsed],
      ['', ''],
      ['Distribuição de Planos', ''],
      ...stats.planDistribution.map(plan => [plan.plan, `${plan.count} (${plan.percentage}%)`])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-semanal-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Sucesso!",
      description: "Relatório semanal exportado com sucesso.",
    });
  };

  useEffect(() => {
    loadSystemStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-96">
          <CardContent className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Carregando analytics avançados...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Não foi possível carregar as estatísticas.</p>
        <Button onClick={loadSystemStats}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="space-y-6">
      {/* Botões de Exportação */}
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={exportWeeklyReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório Semanal (CSV)
        </Button>
        <Button onClick={loadSystemStats} variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Atualizar Dados
        </Button>
      </div>

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
              {stats.activeUsers7Days} ativos (7 dias)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uploads Totais</CardTitle>
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
              {stats.featureUsage.find(f => f.feature === 'Flashcards')?.percentage}% do uso total
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
              {stats.featureUsage.find(f => f.feature === 'Quizzes')?.percentage}% do uso total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Novos Usuários por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Novos Usuários (Últimos 7 Dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.newUsersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Novos Usuários" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Planos */}
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
                  label={({ name, percentage }) => `${name} ${percentage}%`}
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

      {/* Atividade por Funcionalidade e Top Usuários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividade dos Últimos 7 Dias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade por Funcionalidade
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

        {/* Top Usuários da Semana */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Usuários da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topUsers.map((user, index) => (
                <div key={user.email} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{user.email}</div>
                      <div className="text-xs text-muted-foreground">
                        📤 {user.uploads} • 🧠 {user.flashcards} • 🎯 {user.quizzes}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{user.totalActivity}</div>
                    <div className="text-xs text-muted-foreground">atividades</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uso por Funcionalidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uso por Funcionalidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.featureUsage.map((feature, index) => (
              <div key={feature.feature} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold" style={{ color: COLORS[index] }}>
                  {feature.count}
                </div>
                <div className="text-sm font-medium">{feature.feature}</div>
                <div className="text-xs text-muted-foreground">{feature.percentage}% do total</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalyticsDashboard;
