import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnhancedQuizSystem } from '@/hooks/useEnhancedQuizSystem';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

const QuizAnalyticsCharts = () => {
  const { analytics } = useEnhancedQuizSystem();

  // Mock data for demonstration - in real app, this would come from the analytics
  const performanceData = analytics?.recentPerformance || [
    { date: '2024-01-01', accuracy: 75, quizzesCompleted: 3 },
    { date: '2024-01-02', accuracy: 80, quizzesCompleted: 2 },
    { date: '2024-01-03', accuracy: 85, quizzesCompleted: 4 },
    { date: '2024-01-04', accuracy: 78, quizzesCompleted: 1 },
    { date: '2024-01-05', accuracy: 90, quizzesCompleted: 3 },
    { date: '2024-01-06', accuracy: 88, quizzesCompleted: 2 },
    { date: '2024-01-07', accuracy: 92, quizzesCompleted: 5 }
  ];

  const topicData = [
    { topic: 'Matemática', correct: 45, total: 60, accuracy: 75 },
    { topic: 'Português', correct: 38, total: 42, accuracy: 90.5 },
    { topic: 'História', correct: 28, total: 35, accuracy: 80 },
    { topic: 'Geografia', correct: 22, total: 30, accuracy: 73.3 },
    { topic: 'Ciências', correct: 33, total: 40, accuracy: 82.5 }
  ];

  const difficultyData = [
    { name: 'Fácil', value: 40, correct: 35, color: '#10B981' },
    { name: 'Médio', value: 35, correct: 25, color: '#F59E0B' },
    { name: 'Difícil', value: 25, correct: 15, color: '#EF4444' }
  ];

  const weeklyProgressData = [
    { day: 'Dom', quizzes: 2, xp: 120 },
    { day: 'Seg', quizzes: 4, xp: 280 },
    { day: 'Ter', quizzes: 3, xp: 190 },
    { day: 'Qua', quizzes: 5, xp: 350 },
    { day: 'Qui', quizzes: 2, xp: 140 },
    { day: 'Sex', quizzes: 6, xp: 420 },
    { day: 'Sab', quizzes: 3, xp: 210 }
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold">Análises Detalhadas</h2>
      </div>

      {/* Performance Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Evolução da Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(label) => `Data: ${formatDate(label)}`}
                  formatter={(value, name) => [
                    name === 'accuracy' ? `${value}%` : value,
                    name === 'accuracy' ? 'Precisão' : 'Quizzes Completados'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#accuracyGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="quizzesCompleted"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Performance por Tópico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis />
                  <Tooltip 
                  formatter={(value, name) => [
                    name === 'accuracy' ? `${typeof value === 'number' ? value.toFixed(1) : value}%` : value,
                    name === 'accuracy' ? 'Precisão' : 
                    name === 'correct' ? 'Corretas' : 'Total'
                  ]}
                  />
                  <Bar dataKey="accuracy" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-orange-500" />
              Distribuição por Dificuldade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, value}) => `${name}: ${value}%`}
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            Progresso Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="quizzes" 
                  fill="#6366F1" 
                  name="Quizzes Completados"
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="xp" 
                  fill="#F59E0B" 
                  name="XP Ganho"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics?.totalQuizzes || 0}
            </div>
            <div className="text-sm text-gray-600">Total de Quizzes</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {analytics?.averageAccuracy ? `${Math.round(analytics.averageAccuracy)}%` : '0%'}
            </div>
            <div className="text-sm text-gray-600">Precisão Média</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analytics?.streakData?.current || 0}
            </div>
            <div className="text-sm text-gray-600">Sequência Atual</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analytics?.totalTimeSpent ? `${Math.round(analytics.totalTimeSpent / 60)}` : '0'}min
            </div>
            <div className="text-sm text-gray-600">Tempo Total</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizAnalyticsCharts;