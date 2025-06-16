
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  Activity,
  Loader2
} from 'lucide-react';
import { useUsageAnalytics } from '@/hooks/useUsageAnalytics';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const UsageAnalytics = () => {
  const { analytics, loading, getUsageAnalytics, exportAnalyticsToCSV } = useUsageAnalytics();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    getUsageAnalytics(startDate, endDate);
  }, [startDate, endDate]);

  const processDataForCharts = () => {
    // Group by date
    const dailyData = analytics.reduce((acc, item) => {
      const date = item.usage_date;
      if (!acc[date]) {
        acc[date] = { date, upload: 0, resumo: 0, quiz: 0, flashcard: 0, total_users: 0 };
      }
      acc[date][item.action_type] = item.total_actions;
      acc[date].total_users += item.unique_users;
      return acc;
    }, {} as Record<string, any>);

    const chartData = Object.values(dailyData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Action type summary
    const actionSummary = analytics.reduce((acc, item) => {
      const existing = acc.find(a => a.action_type === item.action_type);
      if (existing) {
        existing.total_actions += item.total_actions;
        existing.total_credits += item.total_credits;
      } else {
        acc.push({
          action_type: item.action_type,
          total_actions: item.total_actions,
          total_credits: item.total_credits
        });
      }
      return acc;
    }, [] as any[]);

    return { chartData, actionSummary };
  };

  const { chartData, actionSummary } = processDataForCharts();

  const totalActions = actionSummary.reduce((sum, item) => sum + item.total_actions, 0);
  const totalCredits = actionSummary.reduce((sum, item) => sum + item.total_credits, 0);
  const uniqueUsers = analytics.reduce((acc, item) => acc + item.unique_users, 0);

  const handleExport = () => {
    exportAnalyticsToCSV(analytics);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2">Carregando analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Analytics de Uso
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto"
                />
                <span className="text-sm text-gray-500">até</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto"
                />
              </div>
              
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Ações</p>
                <p className="text-2xl font-bold text-gray-900">{totalActions}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuários Únicos</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueUsers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Créditos</p>
                <p className="text-2xl font-bold text-gray-900">{totalCredits}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Média por Dia</p>
                <p className="text-2xl font-bold text-gray-900">
                  {chartData.length > 0 ? Math.round(totalActions / chartData.length) : 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Uso Diário por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  />
                  <Bar dataKey="upload" stackId="a" fill="#3B82F6" name="Uploads" />
                  <Bar dataKey="resumo" stackId="a" fill="#10B981" name="Resumos" />
                  <Bar dataKey="flashcard" stackId="a" fill="#F59E0B" name="Flashcards" />
                  <Bar dataKey="quiz" stackId="a" fill="#EF4444" name="Quizzes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Action Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo de Ação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={actionSummary}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ action_type, percent }) => `${action_type} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_actions"
                  >
                    {actionSummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Tipo de Ação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Tipo de Ação</th>
                  <th className="text-left p-2">Total de Ações</th>
                  <th className="text-left p-2">Total de Créditos</th>
                  <th className="text-left p-2">Porcentagem</th>
                </tr>
              </thead>
              <tbody>
                {actionSummary.map((action, index) => (
                  <tr key={action.action_type} className="border-b">
                    <td className="p-2">
                      <Badge 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        className="text-white"
                      >
                        {action.action_type}
                      </Badge>
                    </td>
                    <td className="p-2">{action.total_actions}</td>
                    <td className="p-2">{action.total_credits}</td>
                    <td className="p-2">
                      {totalActions > 0 ? ((action.total_actions / totalActions) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageAnalytics;
