import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEnhancedQuizSystem } from '@/hooks/useEnhancedQuizSystem';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Target, Star, TrendingUp, Calendar, Brain, Zap } from 'lucide-react';

const StudyRecommendations = () => {
  const { analytics } = useEnhancedQuizSystem();
  const navigate = useNavigate();

  // Generate personalized recommendations based on user performance
  const generateRecommendations = () => {
    const totalQuizzes = analytics?.totalQuizzes || 0;
    const averageAccuracy = analytics?.averageAccuracy || 0;
    const currentStreak = analytics?.streakData?.current || 0;
    
    const recommendations = [];

    // Based on quiz count
    if (totalQuizzes < 5) {
      recommendations.push({
        type: 'foundation',
        title: 'Construa sua Base de Conhecimento',
        description: 'Complete mais quizzes para identificar seus pontos fortes e fracos.',
        action: 'Fazer 3 quizzes esta semana',
        priority: 'high',
        icon: BookOpen,
        color: 'blue'
      });
    }

    // Based on accuracy
    if (averageAccuracy < 60) {
      recommendations.push({
        type: 'improvement',
        title: 'Melhore sua Precisão',
        description: 'Sua precisão atual está abaixo do ideal. Foque em qualidade ao invés de quantidade.',
        action: 'Revisar material antes dos quizzes',
        priority: 'high',
        icon: Target,
        color: 'red'
      });
    } else if (averageAccuracy < 80) {
      recommendations.push({
        type: 'practice',
        title: 'Continue Praticando',
        description: 'Você está no caminho certo! Pratique regularmente para melhorar ainda mais.',
        action: 'Fazer 1 quiz por dia',
        priority: 'medium',
        icon: TrendingUp,
        color: 'yellow'
      });
    } else {
      recommendations.push({
        type: 'excellence',
        title: 'Mantenha a Excelência',
        description: 'Parabéns! Sua precisão está excelente. Mantenha o ritmo.',
        action: 'Experimentar quizzes mais difíceis',
        priority: 'low',
        icon: Star,
        color: 'green'
      });
    }

    // Based on streak
    if (currentStreak === 0) {
      recommendations.push({
        type: 'consistency',
        title: 'Desenvolva Consistência',
        description: 'Estudar regularmente é chave para o sucesso. Comece uma sequência hoje!',
        action: 'Fazer 1 quiz hoje',
        priority: 'medium',
        icon: Calendar,
        color: 'purple'
      });
    } else if (currentStreak < 7) {
      recommendations.push({
        type: 'streak',
        title: 'Continue sua Sequência',
        description: `Você tem ${currentStreak} dias consecutivos. Continue assim!`,
        action: 'Manter sequência por 7 dias',
        priority: 'medium',
        icon: Zap,
        color: 'orange'
      });
    }

    // Time-based recommendations
    const currentHour = new Date().getHours();
    if (currentHour >= 18 && currentHour <= 22) {
      recommendations.push({
        type: 'timing',
        title: 'Horário Ideal para Estudar',
        description: 'Este é um ótimo horário para estudar e reter informações.',
        action: 'Aproveitar para fazer um quiz agora',
        priority: 'low',
        icon: Clock,
        color: 'indigo'
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  const customStudyPlans = [
    {
      title: 'Plano de Revisão Intensiva',
      description: 'Para tópicos com baixa performance',
      duration: '1 semana',
      activities: [
        'Revisar material teórico',
        'Fazer 2 quizzes por dia',
        'Anotar dúvidas e erros',
        'Revisão final no último dia'
      ],
      difficulty: 'Intensivo',
      color: 'red'
    },
    {
      title: 'Plano de Manutenção',
      description: 'Para manter conhecimentos adquiridos',
      duration: '2 semanas',
      activities: [
        'Fazer 1 quiz a cada 2 dias',
        'Revisar tópicos semanalmente',
        'Praticar tópicos fracos',
        'Acompanhar progresso'
      ],
      difficulty: 'Moderado',
      color: 'blue'
    },
    {
      title: 'Plano de Excelência',
      description: 'Para quem já tem boa performance',
      duration: '1 mês',
      activities: [
        'Quizzes desafiadores',
        'Explorar novos tópicos',
        'Competir no ranking',
        'Ajudar outros estudantes'
      ],
      difficulty: 'Avançado',
      color: 'green'
    }
  ];

  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-green-200 bg-green-50'
  };

  const iconColors = {
    red: 'text-red-500',
    blue: 'text-blue-500',
    yellow: 'text-yellow-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    indigo: 'text-indigo-500'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-6 w-6 text-green-500" />
        <h2 className="text-2xl font-bold">Recomendações Personalizadas</h2>
      </div>

      {/* Personal Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações Baseadas em sua Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${priorityColors[rec.priority as keyof typeof priorityColors]}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-6 w-6 ${iconColors[rec.color as keyof typeof iconColors]} mt-1`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{rec.title}</h3>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                          {rec.priority === 'high' ? 'Urgente' : rec.priority === 'medium' ? 'Importante' : 'Sugestão'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{rec.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          💡 Ação sugerida: {rec.action}
                        </span>
                        <Button size="sm" onClick={() => navigate('/my-summaries')}>
                          Começar Agora
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Study Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Planos de Estudo Personalizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {customStudyPlans.map((plan, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{plan.title}</h3>
                  <Badge className={
                    plan.color === 'red' ? 'bg-red-100 text-red-800' :
                    plan.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {plan.difficulty}
                  </Badge>
                </div>
                
                <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Duração: {plan.duration}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {plan.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  Seguir este Plano
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/my-summaries')}>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Estudar Material</h3>
            <p className="text-sm text-gray-600">Revisar resumos e materiais</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/quiz-history')}>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Praticar Quiz</h3>
            <p className="text-sm text-gray-600">Fazer novos quizzes</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/my-flashcards')}>
          <CardContent className="p-4 text-center">
            <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Revisar Flashcards</h3>
            <p className="text-sm text-gray-600">Memorização ativa</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudyRecommendations;