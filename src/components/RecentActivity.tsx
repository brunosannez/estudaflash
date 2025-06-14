
import { FileText, Brain, Target, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const activities = [
  {
    type: 'upload',
    title: 'Matemática - Equações Quadráticas',
    time: '2 horas atrás',
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  {
    type: 'flashcard',
    title: 'Estudou 15 flashcards de História',
    time: '5 horas atrás',
    icon: Brain,
    color: 'text-purple-600',
    bg: 'bg-purple-100'
  },
  {
    type: 'quiz',
    title: 'Quiz de Física - 8/10 acertos',
    time: '1 dia atrás',
    icon: Target,
    color: 'text-green-600',
    bg: 'bg-green-100'
  },
  {
    type: 'achievement',
    title: 'Conquistou: Estudante Dedicado',
    time: '2 dias atrás',
    icon: Award,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100'
  }
];

const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`p-2 rounded-full ${activity.bg}`}>
                <activity.icon className={`h-4 w-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
