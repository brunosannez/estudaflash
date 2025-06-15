
import { supabase } from '@/integrations/supabase/client';
import { Plan, Subscription, UserPlanDetails, ActivePlan } from '@/types/plans';

export class PlansService {
  static async getAllPlans(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price_brl', { ascending: true });

    if (error) {
      console.error('Erro ao buscar planos:', error);
      throw error;
    }

    return data || [];
  }

  static async getActivePlans(): Promise<ActivePlan[]> {
    const { data, error } = await supabase.rpc('get_active_plans');

    if (error) {
      console.error('Erro ao buscar planos ativos:', error);
      throw error;
    }

    return data || [];
  }

  static async getUserPlanDetails(userId?: string): Promise<UserPlanDetails | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_plan_details', {
        user_uuid: userId || undefined
      });

      if (error) {
        console.error('Erro ao buscar detalhes do plano:', error);
        throw error;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Erro no getUserPlanDetails:', error);
      throw error;
    }
  }

  static async updateUserPlan(userId: string, planId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('admin_change_user_plan_new', {
        target_user_id: userId,
        new_plan_id: planId
      });

      if (error) {
        console.error('Erro ao alterar plano:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no updateUserPlan:', error);
      throw error;
    }
  }

  static async updatePlan(planId: string, updates: Partial<Plan>): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('admin_update_plan', {
        target_plan_id: planId,
        new_price_brl: updates.price_brl,
        new_price_brl_yearly: updates.price_brl_yearly,
        new_uploads_limit: updates.uploads_limit,
        new_summaries_limit: updates.summaries_limit,
        new_flashcards_limit: updates.flashcards_limit,
        new_quizzes_limit: updates.quizzes_limit,
        new_quiz_model: updates.quiz_model,
        new_summary_model: updates.summary_model,
        new_flashcard_model: updates.flashcard_model,
        new_is_editable: updates.is_editable,
        new_features: updates.features,
        new_description: updates.description,
        new_is_active: updates.is_active
      });

      if (error) {
        console.error('Erro ao atualizar plano:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no updatePlan:', error);
      throw error;
    }
  }

  static async createPlan(planData: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('admin_create_plan', {
        plan_name: planData.name,
        plan_description: planData.description,
        plan_price_brl: planData.price_brl,
        plan_price_brl_yearly: planData.price_brl_yearly,
        plan_uploads_limit: planData.uploads_limit,
        plan_summaries_limit: planData.summaries_limit,
        plan_flashcards_limit: planData.flashcards_limit,
        plan_quizzes_limit: planData.quizzes_limit,
        plan_quiz_model: planData.quiz_model,
        plan_summary_model: planData.summary_model,
        plan_flashcard_model: planData.flashcard_model,
        plan_features: planData.features,
        plan_is_active: planData.is_active
      });

      if (error) {
        console.error('Erro ao criar plano:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no createPlan:', error);
      throw error;
    }
  }

  static async createSubscription(subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar assinatura:', error);
      throw error;
    }

    return {
      ...data,
      status: data.status as 'active' | 'canceled' | 'pending'
    };
  }

  static async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar assinaturas:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      status: item.status as 'active' | 'canceled' | 'pending'
    }));
  }
}
