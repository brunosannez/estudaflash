import { useState, useEffect } from 'react';
import { AdvancedAnalyticsService, AnalyticsMetrics } from '@/services/advancedAnalyticsService';
import { useAuth } from './useAuth';

export const useAdvancedAnalytics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const track = async (eventName: string, properties?: Record<string, any>) => {
    await AdvancedAnalyticsService.track({
      event_name: eventName,
      event_properties: properties,
      page_url: window.location.href,
      referrer: document.referrer
    }, user?.id);
  };

  const getDashboardMetrics = async (startDate: Date, endDate: Date) => {
    setLoading(true);
    try {
      const data = await AdvancedAnalyticsService.getDashboardMetrics(startDate, endDate);
      setMetrics(data);
      return data;
    } catch (error) {
      console.error('Failed to get dashboard metrics:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (startDate: Date, endDate: Date, format: 'csv' | 'json' = 'csv') => {
    try {
      const reportData = await AdvancedAnalyticsService.exportReport(startDate, endDate, format);
      
      // Create download link
      const blob = new Blob([reportData], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Failed to export report:', error);
      return false;
    }
  };

  // Auto-track page views
  useEffect(() => {
    track('page_view', {
      path: window.location.pathname,
      search: window.location.search
    });
  }, []);

  return {
    metrics,
    loading,
    track,
    getDashboardMetrics,
    exportReport
  };
};