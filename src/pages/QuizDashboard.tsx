import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/navigation/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import QuizConfigurationDashboard from '@/components/quiz/QuizConfigurationDashboard';
import BadgeShowcase from '@/components/quiz/BadgeShowcase';
import QuizAnalyticsCharts from '@/components/quiz/QuizAnalyticsCharts';
import WeakTopicsAnalysis from '@/components/quiz/WeakTopicsAnalysis';
import StudyRecommendations from '@/components/quiz/StudyRecommendations';
import EnhancedQuizDashboard from '@/components/quiz/EnhancedQuizDashboard';
import { ArrowLeft, Settings, Trophy, BarChart3, AlertTriangle, Brain } from 'lucide-react';

const QuizDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const handleBack = () => {
    navigate('/quiz-history');
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleBack}
            variant="ghost" 
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard de Quiz Avançado
            </h1>
            <p className="text-gray-600">
              Análises detalhadas, configurações e recomendações personalizadas
            </p>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Análises
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="weak-topics" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pontos Fracos
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Recomendações
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <EnhancedQuizDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <QuizAnalyticsCharts />
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <BadgeShowcase />
          </TabsContent>

          <TabsContent value="weak-topics" className="space-y-6">
            <WeakTopicsAnalysis />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <StudyRecommendations />
          </TabsContent>

          <TabsContent value="config" className="space-y-6">
            <QuizConfigurationDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default QuizDashboard;