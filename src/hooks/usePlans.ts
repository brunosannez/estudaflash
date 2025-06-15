
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PlansService } from '@/services/plansService';
import { Plan, UserPlanDetails } from '@/types/plans';

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await PlansService.getAllPlans();
      setPlans(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar planos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (planId: string, updates: Partial<Plan>) => {
    try {
      await PlansService.updatePlan(planId, updates);
      await loadPlans(); // Reload plans
      
      toast({
        title: "Sucesso!",
        description: "Plano atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar plano. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    plans,
    loading,
    loadPlans,
    updatePlan,
  };
};

export const useUserPlan = (userId?: string) => {
  const [userPlan, setUserPlan] = useState<UserPlanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserPlan();
  }, [userId]);

  const loadUserPlan = async () => {
    try {
      setLoading(true);
      const data = await PlansService.getUserPlanDetails(userId);
      setUserPlan(data);
    } catch (error) {
      console.error('Erro ao carregar plano do usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar plano do usuário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    userPlan,
    loading,
    loadUserPlan,
  };
};
