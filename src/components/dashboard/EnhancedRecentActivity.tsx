
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Brain, Target, Award, RefreshCw, ExternalLink, TrendingUp } from 'lucide-react';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { useNavigate } from 'react-router-dom';

const iconMap = {
  FileText,
  Brain,
  Target,
  Award
};

const EnhancedRecentActivity = () => {
  const { activities, loading, refreshActivity } = useRecentActivity();
  const navigate = useNavigate();

  const handleActivityClick = (activity: any) => {
    if (activity.type === 'upload' && activity.resumoId) {
      navigate(`/resumo/${activity.resumoId}`);
    } else if (activity.type === 'flashcard') {
      navigate('/my-flashcards');
    } else if (activity.type === 'quiz') {
      navigate('/quiz-history');
    }
  };

  const getActivityBadge = (activity: any) => {
    if (activity.type === 'quiz_session') {
      const accuracy = activity.title.includes('100%') ? 100 : 
                     activity.title.includes('90%') ? 90 :
                     activity.title.includes('80%') ? 80 : 70;
      return (
        <Badge variant={accuracy >= 80 ? "default" : "secondary"} className="text-xs">
          {accuracy >= 90 ? "Excelente!" : accuracy >= 80 ? "Muito bom!" : "Continue!"}
        </Badge>
      );
    }
    if (activity.type === 'flashcard') {
      return <Badge variant="outline" className="text-xs">Revisão</Badge>;
    }
    if (activity.type === 'upload') {
      return <Badge variant="secondary" className="text-xs">Novo</Badge>;
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            Atividade Recente
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={refreshActivity} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && activities.length === 0 ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3 p-3 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <FileText className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <p className="text-sm font-medium mb-2">Nenhuma atividade ainda</p>
            <p className="text-xs">Comece fazendo upload de uma imagem!</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => navigate('/upload')}
            >
              Fazer Upload
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {activities.slice(0, 6).map((activity) => {
              const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || FileText;
              return (
                <div 
                  key={activity.id} 
                  className="group flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className={`p-2 rounded-full ${activity.bg} group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      {getActivityBadge(activity)}
                    </div>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
            
            {activities.length > 6 && (
              <div className="text-center pt-3 border-t">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/progress')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Ver todas as atividades
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedRecentActivity;
