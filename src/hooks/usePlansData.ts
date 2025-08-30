import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Plan {
  id: string;
  name: string;
  description: string;
  price_brl: number;
  price_brl_yearly: number;
  uploads_limit: number;
  summaries_limit: number;
  flashcards_limit: number;
  quizzes_limit: number;
  features: string[];
}

export const usePlansData = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('is_active', true)
          .order('price_brl', { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getPlanByName = (planName: string) => {
    return plans.find(plan => plan.name.toLowerCase() === planName.toLowerCase());
  };

  const getNextPlan = (currentPlanName: string) => {
    const currentPlan = getPlanByName(currentPlanName);
    const currentIndex = plans.findIndex(plan => plan.id === currentPlan?.id);
    
    // Return next plan in price order, or the most expensive if already at the top
    if (currentIndex >= 0 && currentIndex < plans.length - 1) {
      return plans[currentIndex + 1];
    }
    
    // If free plan or no plan found, return pro plan
    return getPlanByName('pro') || plans[1];
  };

  return {
    plans,
    loading,
    getPlanByName,
    getNextPlan,
  };
};