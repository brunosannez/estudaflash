import { useState, useEffect } from 'react';
import { NotificationService, NotificationPreferences } from '@/services/notificationService';
import { useAuth } from './useAuth';

export const useNotificationManager = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    
    // Initialize push notifications
    NotificationService.initializePushNotifications();
    
    // Load user preferences
    if (user?.id) {
      loadPreferences();
    }
  }, [user?.id]);

  const loadPreferences = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const prefs = await NotificationService.getNotificationPreferences(user.id);
      setPreferences(prefs || {
        email_notifications: true,
        push_notifications: true,
        study_reminders: true,
        achievement_alerts: true,
        social_updates: true,
        marketing_emails: false
      });
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    if (!user?.id) return false;

    setLoading(true);
    try {
      const success = await NotificationService.updateNotificationPreferences(user.id, newPreferences);
      if (success) {
        setPreferences(prev => prev ? { ...prev, ...newPreferences } : null);
      }
      return success;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (title: string, message: string, data?: Record<string, any>) => {
    if (!preferences?.push_notifications) return;
    
    await NotificationService.sendPushNotification({
      title,
      message,
      data
    });
  };

  const scheduleStudyReminder = async (reminderTime: Date, message: string) => {
    if (!user?.id || !preferences?.study_reminders) return;
    
    await NotificationService.scheduleStudyReminder(user.id, reminderTime, message);
  };

  return {
    preferences,
    isSupported,
    loading,
    updatePreferences,
    sendNotification,
    scheduleStudyReminder,
    refreshPreferences: loadPreferences
  };
};