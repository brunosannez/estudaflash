import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Target, 
  Plus, 
  Clock, 
  Brain, 
  Trophy,
  Calendar,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { useStudyObjectives } from '@/hooks/useStudyObjectives';
import { toast } from 'sonner';

const StudyObjectiveManager = () => {
  const { 
    objectives, 
    loading, 
    createObjective, 
    deleteObjective,
    getActiveObjectives,
    getCompletedObjectives 
  } = useStudyObjectives();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    objective_type: 'daily' as 'daily' | 'weekly' | 'monthly' | 'custom',
    target_metric: 'cards_reviewed' as 'cards_reviewed' | 'study_time' | 'quiz_accuracy' | 'streak',
    target_value: 0,
    subject_area: '',
    difficulty_level: 3,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    reward_xp: 50
  });

  const activeObjectives = getActiveObjectives();
  const completedObjectives = getCompletedObjectives();

  const handleCreateObjective = async () => {
    if (!newObjective.title || newObjective.target_value <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const result = await createObjective({
      ...newObjective,
      end_date: newObjective.end_date || undefined,
      streak_bonus_multiplier: 1.0
    });

    if (result) {
      setShowCreateDialog(false);
      setNewObjective({
        title: '',
        description: '',
        objective_type: 'daily',
        target_metric: 'cards_reviewed',
        target_value: 0,
        subject_area: '',
        difficulty_level: 3,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        reward_xp: 50
      });
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'cards_reviewed': return 'Cards Revisados';
      case 'study_time': return 'Tempo de Estudo (min)';
      case 'quiz_accuracy': return 'Precisão em Quizzes (%)';
      case 'streak': return 'Sequência de Dias';
      default: return metric;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Diária';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'custom': return 'Personalizada';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-500" />
            Metas de Estudo
          </h2>
          <p className="text-muted-foreground">
            Defina e acompanhe seus objetivos de aprendizado
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Meta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newObjective.title}
                  onChange={(e) => setNewObjective(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Revisar 20 flashcards por dia"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newObjective.description}
                  onChange={(e) => setNewObjective(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição opcional da meta"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select 
                    value={newObjective.objective_type} 
                    onValueChange={(value: any) => setNewObjective(prev => ({ ...prev, objective_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diária</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="custom">Personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Métrica</Label>
                  <Select 
                    value={newObjective.target_metric} 
                    onValueChange={(value: any) => setNewObjective(prev => ({ ...prev, target_metric: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cards_reviewed">Cards Revisados</SelectItem>
                      <SelectItem value="study_time">Tempo de Estudo</SelectItem>
                      <SelectItem value="quiz_accuracy">Precisão Quiz</SelectItem>
                      <SelectItem value="streak">Sequência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_value">Meta</Label>
                  <Input
                    id="target_value"
                    type="number"
                    value={newObjective.target_value}
                    onChange={(e) => setNewObjective(prev => ({ ...prev, target_value: Number(e.target.value) }))}
                    placeholder="20"
                  />
                </div>

                <div>
                  <Label htmlFor="reward_xp">Recompensa XP</Label>
                  <Input
                    id="reward_xp"
                    type="number"
                    value={newObjective.reward_xp}
                    onChange={(e) => setNewObjective(prev => ({ ...prev, reward_xp: Number(e.target.value) }))}
                    placeholder="50"
                  />
                </div>
              </div>

              <Button onClick={handleCreateObjective} className="w-full">
                Criar Meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Objectives */}
      {activeObjectives.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Metas Ativas ({activeObjectives.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeObjectives.map((objective) => {
              const progressPercentage = (objective.current_progress / objective.target_value) * 100;
              
              return (
                <Card key={objective.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{objective.title}</CardTitle>
                        {objective.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {objective.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteObjective(objective.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {objective.current_progress} / {objective.target_value}
                      </span>
                      <Badge variant="outline">
                        {getTypeLabel(objective.objective_type)}
                      </Badge>
                    </div>
                    
                    <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{getMetricLabel(objective.target_metric)}</span>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        {objective.reward_xp} XP
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Objectives */}
      {completedObjectives.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Metas Concluídas ({completedObjectives.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedObjectives.slice(0, 6).map((objective) => (
              <Card key={objective.id} className="border-l-4 border-l-green-500 opacity-75">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {objective.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Concluída em {new Date(objective.completed_at!).toLocaleDateString('pt-BR')}
                    </span>
                    <Badge variant="secondary">
                      +{objective.reward_xp} XP
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {objectives.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma meta definida</h3>
            <p className="text-muted-foreground mb-4">
              Crie suas primeiras metas de estudo para manter o foco e motivação
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudyObjectiveManager;