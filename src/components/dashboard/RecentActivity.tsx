
import { FileText, Brain, Target, Award, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const iconMap = {
  FileText,
  Brain,
  Target,
  Award
};

const RecentActivity = () => {
  const { activities, loading, refreshActivity } = useRecentActivity();
  const navigate = useNavigate();

  const handleActivityClick = (activity: any) => {
    // Navigate based on activity type
    if (activity.type === 'upload' && activity.resumoId) {
      navigate(`/resumo/${activity.resumoId}`);
    } else if (activity.type === 'flashcard' && activity.resumoId) {
      navigate(`/flashcards`);
    } else if (activity.type === 'quiz' && activity.resumoId) {
      navigate(`/quiz-history`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Atividade Recente
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => refreshActivity()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Atualizar atividades</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && activities.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <FileText className="h-12 w-12 mx-auto text-gray-300" />
            </div>
            <p className="text-sm font-medium">Nenhuma atividade ainda</p>
            <p className="text-xs mt-2">Comece fazendo upload de uma imagem!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => {
              const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || FileText;
              return (
                <div 
                  key={activity.id} 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className={`p-2 rounded-full ${activity.bg}`}>
                    <IconComponent className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
            
            {activities.length > 5 && (
              <div className="text-center pt-2">
                <button 
                  onClick={() => navigate('/progress')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver mais atividades
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
