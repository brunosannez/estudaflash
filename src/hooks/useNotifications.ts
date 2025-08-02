import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useNotifications = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      // Setup notification permissions
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Initialize unread count
      setUnreadCount(3); // Mock data
    }
  }, [user?.id]);

  const showNotification = (title: string, message: string) => {
    toast(title, { description: message });
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message, icon: '/favicon.ico' });
    }
  };

  const markAsRead = (id: string) => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return {
    unreadCount,
    showNotification,
    markAsRead
  };
};