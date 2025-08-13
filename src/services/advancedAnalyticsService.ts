import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEvent {
  event_name: string;
  event_properties?: Record<string, any>;
  user_properties?: Record<string, any>;
  page_url?: string;
  referrer?: string;
}

export interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  sessionDuration: number;
  retentionRate: number;
  conversionRate: number;
  topFeatures: Array<{ feature: string; usage: number }>;
  userEngagement: Array<{ date: string; engagement: number }>;
}

export class AdvancedAnalyticsService {
  private static sessionId = crypto.randomUUID();

  static async track(event: AnalyticsEvent, userId?: string): Promise<void> {
    try {
      const eventData = {
        user_id: userId || null,
        session_id: this.sessionId,
        event_name: event.event_name,
        event_properties: event.event_properties || {},
        user_properties: event.user_properties || {},
        page_url: event.page_url || window.location.href,
        referrer: event.referrer || document.referrer,
        ip_address: null, // Will be set by server if needed
        user_agent: navigator.userAgent
      };

      await supabase.from('analytics_events').insert(eventData);

      // Also send to Google Analytics if configured
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event.event_name, {
          custom_map: event.event_properties,
          page_location: event.page_url,
          page_referrer: event.referrer
        });
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  static async getDashboardMetrics(startDate: Date, endDate: Date): Promise<AnalyticsMetrics> {
    try {
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) throw error;

      // Calculate metrics from events
      const uniqueUsers = new Set(events?.map(e => e.user_id).filter(Boolean)).size;
      const totalSessions = new Set(events?.map(e => e.session_id)).size;
      
      // Calculate engagement metrics
      const featureUsage = events?.reduce((acc, event) => {
        const feature = event.event_name;
        acc[feature] = (acc[feature] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topFeatures = Object.entries(featureUsage)
        .map(([feature, usage]) => ({ feature, usage }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 10);

      return {
        totalUsers: uniqueUsers,
        activeUsers: uniqueUsers, // Simplified for now
        sessionDuration: 0, // Would need session tracking
        retentionRate: 0, // Would need cohort analysis
        conversionRate: 0, // Would need conversion events
        topFeatures,
        userEngagement: [] // Would need time-series data
      };
    } catch (error) {
      console.error('Failed to get dashboard metrics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        sessionDuration: 0,
        retentionRate: 0,
        conversionRate: 0,
        topFeatures: [],
        userEngagement: []
      };
    }
  }

  static async exportReport(startDate: Date, endDate: Date, format: 'csv' | 'json' = 'csv'): Promise<string> {
    try {
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (format === 'json') {
        return JSON.stringify(events, null, 2);
      }

      // CSV format
      const headers = ['timestamp', 'user_id', 'event_name', 'page_url', 'event_properties'];
      const csvData = events?.map(event => [
        event.timestamp,
        event.user_id || '',
        event.event_name,
        event.page_url || '',
        JSON.stringify(event.event_properties)
      ]);

      const csv = [headers, ...(csvData || [])].map(row => row.join(',')).join('\n');
      return csv;
    } catch (error) {
      console.error('Failed to export report:', error);
      return '';
    }
  }
}