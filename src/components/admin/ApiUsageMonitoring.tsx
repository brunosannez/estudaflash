
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  DollarSign, 
  Zap, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useApiUsageTracking } from '@/hooks/useApiUsageTracking';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B'];

const ApiUsageMonitoring = () => {
  const { apiStats, loading, getApiStats, getRealTimeStats } = useApiUsageTracking();
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    getApiStats(timeRange);
  }, [timeRange]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      getRealTimeStats();
    }, 30000); // Atualiza a cada 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const totalTokens = apiStats.reduce((sum, stat) => sum + stat.total_tokens, 0);
  const totalCost = apiStats.reduce((sum, stat) => sum + stat.total_cost_usd, 0);
  const totalRequests = apiStats.reduce((sum, stat) => sum + stat.requests_count, 0);
  const avgSuccessRate = apiStats.length > 0 
    ? apiStats.reduce((sum, stat) => sum + stat.success_rate, 0) / apiStats.length 
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'anthropic': return '🧠';
      case 'huggingface': return '🤗';
      default: return '🔧';
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'openai': return 'OpenAI (ChatGPT)';
      case 'anthropic': return 'Anthropic (Claude)';
      case 'huggingface': return 'HuggingFace';
      default: return provider;
    }
  };

  // Empty state when no API data (apiStats always has 3 providers, check actual data)
  const hasData = apiStats.some(stat => stat.requests_count > 0);
  if (!loading && !hasData) {
    return (
      <div className="space-y-6">
        {/* Header e Controles */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Monitoramento de APIs em Tempo Real
              </CardTitle>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex gap-1">
                  {['24h', '7d', '30d'].map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Summary cards with zeros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Tokens</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-xs text-muted-foreground mt-1">Últimas {timeRange}</p>
                </div>
                <Zap className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
                  <p className="text-2xl font-bold text-foreground">$0.00</p>
                  <p className="text-xs text-muted-foreground mt-1">Estimativa USD</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Requisições</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-xs text-muted-foreground mt-1">Total de chamadas</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-foreground">-</p>
                  <p className="text-xs text-muted-foreground mt-1">Nenhum dado</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty state message */}
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum uso de API registrado
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-4">
                Os custos e tokens das APIs (OpenAI, Anthropic) aparecerão aqui quando os usuários gerarem resumos, flashcards, quizzes ou mapas mentais.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="text-lg">🧠</span>
                  <span>Anthropic (Claude)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lg">🤖</span>
                  <span>OpenAI (GPT)</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => getApiStats(timeRange)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Dados
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Carregando dados de API...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header e Controles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Monitoramento de APIs em Tempo Real
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-1">
                {['24h', '7d', '30d'].map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
              
              <Button
                variant={autoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto-refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Tokens</p>
                <p className="text-2xl font-bold text-foreground">{formatNumber(totalTokens)}</p>
                <p className="text-xs text-muted-foreground mt-1">Últimas {timeRange}</p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalCost)}</p>
                <p className="text-xs text-muted-foreground mt-1">Estimativa USD</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requisições</p>
                <p className="text-2xl font-bold text-foreground">{formatNumber(totalRequests)}</p>
                <p className="text-xs text-muted-foreground mt-1">Total de chamadas</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-foreground">{avgSuccessRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Média geral</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uso por Provedor */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Tokens por Provedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={apiStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ provider, percent }) => `${getProviderIcon(provider)} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_tokens"
                  >
                    {apiStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatNumber(value), 'Tokens']}
                    labelFormatter={(label) => getProviderName(label)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Custo por Provedor */}
        <Card>
          <CardHeader>
            <CardTitle>Custo por Provedor de API</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={apiStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="provider" 
                    tickFormatter={(value) => getProviderIcon(value)}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value), 'Custo']}
                    labelFormatter={(label) => getProviderName(label)}
                  />
                  <Bar dataKey="total_cost_usd" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes por Provedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Provedor</th>
                  <th className="text-left p-3">Tokens</th>
                  <th className="text-left p-3">Custo (USD)</th>
                  <th className="text-left p-3">Requisições</th>
                  <th className="text-left p-3">Taxa de Sucesso</th>
                  <th className="text-left p-3">Última Requisição</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {apiStats.map((stat, index) => (
                  <tr key={stat.provider} className="border-b">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getProviderIcon(stat.provider)}</span>
                        <span className="font-medium">{getProviderName(stat.provider)}</span>
                      </div>
                    </td>
                    <td className="p-3">{formatNumber(stat.total_tokens)}</td>
                    <td className="p-3">{formatCurrency(stat.total_cost_usd)}</td>
                    <td className="p-3">{formatNumber(stat.requests_count)}</td>
                    <td className="p-3">
                      <Badge 
                        variant={stat.success_rate >= 95 ? 'default' : stat.success_rate >= 85 ? 'secondary' : 'destructive'}
                      >
                        {stat.success_rate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="p-3">
                      {stat.last_request !== 'Nunca' 
                        ? new Date(stat.last_request).toLocaleString('pt-BR')
                        : 'Nunca'
                      }
                    </td>
                    <td className="p-3">
                      {stat.success_rate >= 95 ? (
                        <Badge variant="default">Ótimo</Badge>
                      ) : stat.success_rate >= 85 ? (
                        <Badge variant="secondary">Bom</Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Atenção
                        </Badge>
                      )}
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

export default ApiUsageMonitoring;
