
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UsageAnalyticsData {
  action_type: string;
  usage_date: string;
  total_actions: number;
  unique_users: number;
  total_credits: number;
}

export interface UserUsageSummary {
  action_type: string;
  current_month_usage: number;
  current_month_credits: number;
  all_time_usage: number;
  all_time_credits: number;
}

export const useUsageAnalytics = () => {
  const [analytics, setAnalytics] = useState<UsageAnalyticsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUsageAnalytics = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_usage_analytics', {
        start_date: startDate || null,
        end_date: endDate || null
      });

      if (error) throw error;

      setAnalytics(data || []);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar analytics de uso:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getUserUsageSummary = async (userId: string): Promise<UserUsageSummary[]> => {
    try {
      const { data, error } = await supabase.rpc('get_user_usage_summary', {
        target_user_id: userId
      });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Erro ao buscar resumo de uso do usuário:', err);
      throw err;
    }
  };

  const logUsage = async (
    userId: string, 
    actionType: 'upload' | 'resumo' | 'quiz' | 'flashcard',
    creditsUsed: number = 1,
    metadata: any = {}
  ) => {
    try {
      const { error } = await supabase.rpc('log_usage', {
        target_user_id: userId,
        target_action_type: actionType,
        target_credits_used: creditsUsed,
        target_metadata: metadata
      });

      if (error) throw error;

      console.log(`✅ Uso registrado: ${actionType} (${creditsUsed} créditos)`);
      return true;
    } catch (err) {
      console.error('Erro ao registrar uso:', err);
      return false;
    }
  };

  const exportAnalyticsToCSV = (data: UsageAnalyticsData[]) => {
    const headers = ['Data', 'Tipo de Ação', 'Total de Ações', 'Usuários Únicos', 'Total de Créditos'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.usage_date,
        row.action_type,
        row.total_actions,
        row.unique_users,
        row.total_credits
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    analytics,
    loading,
    error,
    getUsageAnalytics,
    getUserUsageSummary,
    logUsage,
    exportAnalyticsToCSV
  };
};
