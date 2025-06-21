
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, BookOpen, Brain, Target, TrendingUp, Zap, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Fazer Upload",
      description: "Envie suas imagens de estudo",
      icon: Upload,
      color: "from-blue-500 to-purple-600",
      textColor: "text-white",
      onClick: () => navigate('/upload')
    },
    {
      title: "Ver Resumos",
      description: "Acesse seus materiais",
      icon: BookOpen,
      color: "from-green-500 to-teal-600",
      textColor: "text-white",
      onClick: () => navigate('/my-summaries')
    },
    {
      title: "Estudar Flashcards",
      description: "Pratique com seus cards",
      icon: Brain,
      color: "from-orange-500 to-red-600",
      textColor: "text-white",
      onClick: () => navigate('/my-flashcards')
    },
    {
      title: "Ver Progresso",
      description: "Acompanhe sua evolução",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-600",
      textColor: "text-white",
      onClick: () => navigate('/progress')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const IconComponent = action.icon;
        return (
          <Card 
            key={action.title}
            className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
            onClick={action.onClick}
          >
            <CardContent className={`p-0 bg-gradient-to-br ${action.color} ${action.textColor} relative`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className="h-8 w-8 opacity-90" />
                  <Zap className="h-5 w-5 opacity-60 group-hover:animate-pulse" />
                </div>
                <h3 className="text-lg font-bold mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full opacity-10"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white rounded-full opacity-10"></div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuickActions;
