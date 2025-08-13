import { supabase } from '@/integrations/supabase/client';

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  study_reminders: boolean;
  achievement_alerts: boolean;
  social_updates: boolean;
  marketing_emails: boolean;
}

export interface PushNotificationPayload {
  title: string;
  message: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

export class NotificationService {
  private static swRegistration: ServiceWorkerRegistration | null = null;

  static async initializePushNotifications(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Push notifications enabled');
        return true;
      }
      
      console.warn('Push notification permission denied');
      return false;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  static async sendPushNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.swRegistration) {
      await this.initializePushNotifications();
    }

    try {
      // Show notification directly (for demo purposes)
      if (Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.message,
          icon: payload.icon || '/icon-192.png',
          badge: payload.badge,
          data: payload.data
        });
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      return null;
    }
  }

  static async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return false;
    }
  }

  static async scheduleStudyReminder(userId: string, reminderTime: Date, message: string): Promise<void> {
    // For now, just send immediate notification
    // In production, you'd integrate with a job queue system
    const delay = reminderTime.getTime() - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        this.sendPushNotification({
          title: 'Hora de Estudar! 📚',
          message,
          data: { type: 'study_reminder', userId }
        });
      }, delay);
    }
  }
}