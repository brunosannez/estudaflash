
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionWithDetails {
  id: string;
  user_id: string;
  user_email: string;
  plan_id: string;
  plan_name: string;
  amount_paid_brl: number;
  payment_method: string | null;
  start_date: string;
  renewal_date: string | null;
  status: 'active' | 'canceled' | 'pending';
  created_at: string;
}

export interface SubscriptionStats {
  active_count: number;
  canceled_count: number;
  pending_count: number;
  total_revenue: number;
  mrr: number;
}

export class SubscriptionService {
  static async getAllSubscriptions(): Promise<SubscriptionWithDetails[]> {
    try {
      console.log('📊 Carregando assinaturas...');
      
      const { data, error } = await supabase.rpc('get_all_subscriptions_admin');

      if (error) {
        console.error('❌ Erro ao carregar assinaturas:', error);
        throw new Error(`Erro ao carregar assinaturas: ${error.message}`);
      }

      if (!data || !Array.isArray(data)) {
        console.warn('⚠️ Nenhuma assinatura encontrada');
        return [];
      }

      console.log('✅ Assinaturas carregadas:', data.length);

      return data.map(sub => ({
        id: sub.id,
        user_id: sub.user_id,
        user_email: sub.user_email || 'Email não disponível',
        plan_id: sub.plan_id,
        plan_name: sub.plan_name || 'Plano desconhecido',
        amount_paid_brl: Number(sub.amount_paid_brl) || 0,
        payment_method: sub.payment_method,
        start_date: sub.start_date,
        renewal_date: sub.renewal_date,
        status: sub.status as 'active' | 'canceled' | 'pending',
        created_at: sub.created_at
      }));
    } catch (error) {
      console.error('💥 Erro ao carregar assinaturas:', error);
      throw error;
    }
  }

  static async getSubscriptionStats(): Promise<SubscriptionStats> {
    try {
      console.log('📊 Carregando estatísticas de assinaturas...');
      
      const { data, error } = await supabase.rpc('get_subscription_stats');

      if (error) {
        console.error('❌ Erro ao carregar estatísticas:', error);
        throw new Error(`Erro ao carregar estatísticas: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          active_count: 0,
          canceled_count: 0,
          pending_count: 0,
          total_revenue: 0,
          mrr: 0
        };
      }

      const stats = data[0];
      console.log('✅ Estatísticas carregadas:', stats);

      return {
        active_count: Number(stats.active_count) || 0,
        canceled_count: Number(stats.canceled_count) || 0,
        pending_count: Number(stats.pending_count) || 0,
        total_revenue: Number(stats.total_revenue) || 0,
        mrr: Number(stats.mrr) || 0
      };
    } catch (error) {
      console.error('💥 Erro ao carregar estatísticas:', error);
      return {
        active_count: 0,
        canceled_count: 0,
        pending_count: 0,
        total_revenue: 0,
        mrr: 0
      };
    }
  }

  static async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      console.log('🚫 Cancelando assinatura:', subscriptionId);
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('id', subscriptionId);

      if (error) {
        console.error('❌ Erro ao cancelar assinatura:', error);
        throw error;
      }

      console.log('✅ Assinatura cancelada com sucesso');
      return true;
    } catch (error) {
      console.error('💥 Erro ao cancelar assinatura:', error);
      throw error;
    }
  }
}
