import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEnhancedQuizSystem } from '@/hooks/useEnhancedQuizSystem';
import { AlertTriangle, TrendingDown, BookOpen, Target, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WeakTopicsAnalysis = () => {
  const { analytics } = useEnhancedQuizSystem();
  const navigate = useNavigate();

  // Mock data - in real app, this would come from analytics.weakestTopics
  const weakTopics = analytics?.weakestTopics || [
    {
      topic: 'Álgebra',
      total_questions: 15,
      correct_answers: 8,
      accuracy_percentage: 53.3,
      recommendation: 'Revisar conceitos fundamentais de equações e funções'
    },
    {
      topic: 'Geografia Física',
      total_questions: 12,
      correct_answers: 7,
      accuracy_percentage: 58.3,
      recommendation: 'Estudar formações geológicas e clima'
    },
    {
      topic: 'Gramática',
      total_questions: 20,
      correct_answers: 13,
      accuracy_percentage: 65.0,
      recommendation: 'Praticar análise sintática e concordância'
    },
    {
      topic: 'História Medieval',
      total_questions: 8,
      correct_answers: 4,
      accuracy_percentage: 50.0,
      recommendation: 'Revisar feudalismo e Idade Média'
    }
  ];

  const strongTopics = analytics?.strongestTopics || [
    'Matemática Básica',
    'Português - Interpretação',
    'História Contemporânea'
  ];

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBadgeColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-100 text-green-800';
    if (accuracy >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPriorityLevel = (accuracy: number) => {
    if (accuracy < 50) return { level: 'Urgente', color: 'bg-red-500', icon: XCircle };
    if (accuracy < 70) return { level: 'Alta', color: 'bg-orange-500', icon: AlertTriangle };
    return { level: 'Média', color: 'bg-yellow-500', icon: Target };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingDown className="h-6 w-6 text-orange-500" />
        <h2 className="text-2xl font-bold">Análise de Pontos Fracos</h2>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{weakTopics.length}</div>
            <div className="text-sm text-gray-600">Tópicos para Revisar</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{strongTopics.length}</div>
            <div className="text-sm text-gray-600">Tópicos Dominados</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(weakTopics.reduce((acc, topic) => acc + topic.accuracy_percentage, 0) / weakTopics.length) || 0}%
            </div>
            <div className="text-sm text-gray-600">Precisão Média (Pontos Fracos)</div>
          </CardContent>
        </Card>
      </div>

      {/* Weak Topics Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Tópicos que Precisam de Atenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weakTopics.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-600 mb-2">
                Parabéns! Nenhum ponto fraco identificado
              </h3>
              <p className="text-gray-600">
                Continue fazendo quizzes para manter sua performance alta!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {weakTopics.map((topic, index) => {
                const priority = getPriorityLevel(topic.accuracy_percentage);
                const Icon = priority.icon;
                
                return (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-orange-500" />
                        <div>
                          <h3 className="font-semibold text-lg">{topic.topic}</h3>
                          <p className="text-sm text-gray-600">
                            {topic.correct_answers}/{topic.total_questions} questões corretas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${priority.color} text-white`}>
                          {priority.level}
                        </Badge>
                        <Badge className={getAccuracyBadgeColor(topic.accuracy_percentage)}>
                          {topic.accuracy_percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Precisão Atual</span>
                        <span className={getAccuracyColor(topic.accuracy_percentage)}>
                          {topic.accuracy_percentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={topic.accuracy_percentage} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <div className="flex items-start gap-2">
                        <BookOpen className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-800 mb-1">Recomendação de Estudo:</h4>
                          <p className="text-blue-700 text-sm">{topic.recommendation}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate('/my-summaries')}
                      >
                        Buscar Material de Estudo
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => navigate('/quiz-history')}
                      >
                        Praticar com Quizzes
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strong Topics */}
      {strongTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Tópicos que Você Domina
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {strongTopics.map((topic, index) => (
                <Badge key={index} className="bg-green-100 text-green-800 px-3 py-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {topic}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Continue praticando estes tópicos para manter sua excelência!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Action Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Plano de Ação Personalizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <h4 className="font-medium text-purple-800 mb-1">1. Priorize os Tópicos Urgentes</h4>
              <p className="text-purple-700 text-sm">
                Foque primeiro nos tópicos com menos de 50% de precisão
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-medium text-blue-800 mb-1">2. Estude com Material Direcionado</h4>
              <p className="text-blue-700 text-sm">
                Busque resumos específicos para os tópicos identificados
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h4 className="font-medium text-green-800 mb-1">3. Pratique Regularmente</h4>
              <p className="text-green-700 text-sm">
                Refaça quizzes dos tópicos fracos até atingir pelo menos 80% de precisão
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeakTopicsAnalysis;