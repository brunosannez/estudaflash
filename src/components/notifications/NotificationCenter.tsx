import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Bell, 
  Settings, 
  Check, 
  X, 
  BookOpen, 
  Target, 
  Trophy,
  Clock,
  Trash2,
  BellRing
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'reminder' | 'achievement' | 'challenge' | 'social' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: any;
}

interface NotificationSettings {
  flashcardReminders: boolean;
  achievementAlerts: boolean;
  challengeUpdates: boolean;
  socialUpdates: boolean;
  systemNotifications: boolean;
  reminderTime: string;
}

export const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    flashcardReminders: true,
    achievementAlerts: true,
    challengeUpdates: true,
    socialUpdates: true,
    systemNotifications: true,
    reminderTime: '18:00'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      loadSettings();
      setupNotificationScheduler();
    }
  }, [user?.id]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Simular carregamento de notificações
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'reminder',
          title: 'Hora de estudar!',
          message: 'Você tem 5 flashcards prontos para revisão.',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
          actionUrl: '/my-flashcards'
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Conquista desbloqueada!',
          message: 'Você alcançou o nível 3! 🎉',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
          actionUrl: '/social'
        },
        {
          id: '3',
          type: 'challenge',
          title: 'Desafio concluído',
          message: 'Parabéns! Você completou o desafio "Quiz Master".',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    toast.success('Configurações salvas');
  };

  const setupNotificationScheduler = () => {
    // Verificar permissão de notificação
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Configurar lembretes diários
    const scheduleDaily = () => {
      const now = new Date();
      const reminderTime = new Date();
      const [hours, minutes] = settings.reminderTime.split(':');
      reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const timeUntilReminder = reminderTime.getTime() - now.getTime();
      
      setTimeout(() => {
        if (settings.flashcardReminders) {
          showBrowserNotification(
            'EstudaFlash - Hora de estudar!',
            'Não esqueça de revisar seus flashcards hoje!'
          );
        }
        scheduleDaily(); // Reagendar para o próximo dia
      }, timeUntilReminder);
    };

    scheduleDaily();
  };

  const showBrowserNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'challenge':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'social':
        return <BellRing className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (showSettings) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Notificação
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="flashcard-reminders">Lembretes de Flashcards</Label>
              <Switch
                id="flashcard-reminders"
                checked={settings.flashcardReminders}
                onCheckedChange={(checked) =>
                  saveSettings({ ...settings, flashcardReminders: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="achievement-alerts">Alertas de Conquistas</Label>
              <Switch
                id="achievement-alerts"
                checked={settings.achievementAlerts}
                onCheckedChange={(checked) =>
                  saveSettings({ ...settings, achievementAlerts: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="challenge-updates">Atualizações de Desafios</Label>
              <Switch
                id="challenge-updates"
                checked={settings.challengeUpdates}
                onCheckedChange={(checked) =>
                  saveSettings({ ...settings, challengeUpdates: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="social-updates">Atualizações Sociais</Label>
              <Switch
                id="social-updates"
                checked={settings.socialUpdates}
                onCheckedChange={(checked) =>
                  saveSettings({ ...settings, socialUpdates: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-time">Horário dos Lembretes</Label>
              <input
                id="reminder-time"
                type="time"
                value={settings.reminderTime}
                onChange={(e) =>
                  saveSettings({ ...settings, reminderTime: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 px-2 text-xs">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhuma notificação no momento
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.createdAt.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {notification.actionUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => {
                        markAsRead(notification.id);
                        window.location.href = notification.actionUrl!;
                      }}
                    >
                      Ver detalhes
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};