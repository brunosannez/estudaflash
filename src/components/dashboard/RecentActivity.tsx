
import { FileText, Brain, Target, Award, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRecentActivity } from '@/hooks/useRecentActivity';

const iconMap = {
  FileText,
  Brain,
  Target,
  Award
};

interface RecentActivityProps {
  setHasUploads?: (hasUploads: boolean) => void;
}

const RecentActivity = ({ setHasUploads }: RecentActivityProps) => {
  const { activities, loading } = useRecentActivity();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Nenhuma atividade recente encontrada.</p>
            <p className="text-xs mt-2">Comece fazendo upload de uma imagem!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || FileText;
              return (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
