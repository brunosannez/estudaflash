import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudyObjective {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  objective_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  target_metric: 'cards_reviewed' | 'study_time' | 'quiz_accuracy' | 'streak';
  target_value: number;
  current_progress: number;
  subject_area?: string;
  difficulty_level?: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  completed_at?: string;
  reward_xp: number;
  streak_bonus_multiplier: number;
  created_at: string;
  updated_at: string;
}

export const useStudyObjectives = () => {
  const [objectives, setObjectives] = useState<StudyObjective[]>([]);
  const [loading, setLoading] = useState(false);

  const createObjective = useCallback(async (objective: Omit<StudyObjective, 'id' | 'user_id' | 'current_progress' | 'is_active' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('study_objectives')
        .insert({
          ...objective,
          user_id: user.id,
          current_progress: 0,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setObjectives(prev => [...prev, data as StudyObjective]);
      toast.success('Meta criada com sucesso!');
      return data;
    } catch (error) {
      console.error('Error creating objective:', error);
      toast.error('Erro ao criar meta');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProgress = useCallback(async (objectiveId: string, progress: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const objective = objectives.find(obj => obj.id === objectiveId);
      if (!objective) return;

      const isCompleted = progress >= objective.target_value;
      const updateData: any = {
        current_progress: progress,
        updated_at: new Date().toISOString()
      };

      if (isCompleted && !objective.completed_at) {
        updateData.completed_at = new Date().toISOString();
        updateData.is_active = false;
      }

      const { error } = await supabase
        .from('study_objectives')
        .update(updateData)
        .eq('id', objectiveId)
        .eq('user_id', user.id);

      if (error) throw error;

      setObjectives(prev => 
        prev.map(obj => 
          obj.id === objectiveId 
            ? { ...obj, ...updateData }
            : obj
        )
      );

      if (isCompleted && !objective.completed_at) {
        toast.success(`🎉 Meta "${objective.title}" concluída! +${objective.reward_xp} XP`);
      }

    } catch (error) {
      console.error('Error updating objective progress:', error);
      toast.error('Erro ao atualizar progresso da meta');
    }
  }, [objectives]);

  const fetchObjectives = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('study_objectives')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setObjectives((data || []).map(item => ({
        ...item,
        objective_type: item.objective_type as 'daily' | 'weekly' | 'monthly' | 'custom',
        target_metric: item.target_metric as 'cards_reviewed' | 'study_time' | 'quiz_accuracy' | 'streak'
      })));
    } catch (error) {
      console.error('Error fetching objectives:', error);
      toast.error('Erro ao carregar metas');
      setObjectives([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteObjective = useCallback(async (objectiveId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('study_objectives')
        .delete()
        .eq('id', objectiveId)
        .eq('user_id', user.id);

      if (error) throw error;

      setObjectives(prev => prev.filter(obj => obj.id !== objectiveId));
      toast.success('Meta excluída com sucesso');
    } catch (error) {
      console.error('Error deleting objective:', error);
      toast.error('Erro ao excluir meta');
    }
  }, []);

  const getActiveObjectives = useCallback(() => {
    return objectives.filter(obj => obj.is_active);
  }, [objectives]);

  const getCompletedObjectives = useCallback(() => {
    return objectives.filter(obj => obj.completed_at);
  }, [objectives]);

  const checkDailyObjectives = useCallback(async () => {
    const dailyObjectives = objectives.filter(obj => 
      obj.is_active && obj.objective_type === 'daily'
    );

    for (const objective of dailyObjectives) {
      // Reset daily objectives if it's a new day
      const today = new Date().toDateString();
      const objectiveDate = new Date(objective.updated_at).toDateString();
      
      if (today !== objectiveDate) {
        await updateProgress(objective.id, 0);
      }
    }
  }, [objectives, updateProgress]);

  useEffect(() => {
    fetchObjectives();
  }, [fetchObjectives]);

  useEffect(() => {
    checkDailyObjectives();
  }, [checkDailyObjectives]);

  return {
    objectives,
    loading,
    createObjective,
    updateProgress,
    fetchObjectives,
    deleteObjective,
    getActiveObjectives,
    getCompletedObjectives
  };
};