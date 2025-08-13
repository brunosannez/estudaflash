import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { Bell, Settings, Mail, Smartphone, Clock, Trophy, Users, Tag } from 'lucide-react';
import { toast } from 'sonner';

const NotificationCenter = () => {
  const { 
    preferences, 
    isSupported, 
    loading, 
    updatePreferences, 
    sendNotification 
  } = useNotificationManager();
  
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  const handlePreferenceChange = async (key: string, value: boolean) => {
    const success = await updatePreferences({ [key]: value });
    if (success) {
      toast.success('Preferências atualizadas!');
    } else {
      toast.error('Erro ao atualizar preferências');
    }
  };

  const sendTestNotification = async () => {
    await sendNotification(
      'Notificação de Teste 🔔',
      'Esta é uma notificação de teste do EstudaFlash!',
      { type: 'test' }
    );
    setTestNotificationSent(true);
    toast.success('Notificação de teste enviada!');
  };

  if (!preferences) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Central de Notificações</h1>
          <p className="text-muted-foreground">
            Configure suas preferências de notificação
          </p>
        </div>
      </div>

      {!isSupported && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <Badge variant="outline" className="bg-orange-100 text-orange-800">
              Atenção
            </Badge>
            <p className="text-sm">
              Seu navegador não suporta notificações push. Algumas funcionalidades podem estar limitadas.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações de Notificação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferências de Notificação
            </CardTitle>
            <CardDescription>
              Configure quando e como você deseja receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Notificações por Email</p>
                  <p className="text-sm text-muted-foreground">
                    Receba emails sobre atividades importantes
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={(value) => handlePreferenceChange('email_notifications', value)}
                disabled={loading}
              />
            </div>

            <Separator />

            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Notificações Push</p>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações instantâneas no navegador
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.push_notifications && isSupported}
                onCheckedChange={(value) => handlePreferenceChange('push_notifications', value)}
                disabled={loading || !isSupported}
              />
            </div>

            <Separator />

            {/* Study Reminders */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Lembretes de Estudo</p>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes para manter sua rotina de estudos
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.study_reminders}
                onCheckedChange={(value) => handlePreferenceChange('study_reminders', value)}
                disabled={loading}
              />
            </div>

            <Separator />

            {/* Achievement Alerts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Alertas de Conquistas</p>
                  <p className="text-sm text-muted-foreground">
                    Seja notificado sobre badges e marcos alcançados
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.achievement_alerts}
                onCheckedChange={(value) => handlePreferenceChange('achievement_alerts', value)}
                disabled={loading}
              />
            </div>

            <Separator />

            {/* Social Updates */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Atualizações Sociais</p>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações sobre atividades de amigos
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.social_updates}
                onCheckedChange={(value) => handlePreferenceChange('social_updates', value)}
                disabled={loading}
              />
            </div>

            <Separator />

            {/* Marketing Emails */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Emails Promocionais</p>
                  <p className="text-sm text-muted-foreground">
                    Receba emails sobre novidades e promoções
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.marketing_emails}
                onCheckedChange={(value) => handlePreferenceChange('marketing_emails', value)}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Teste de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Notificações</CardTitle>
            <CardDescription>
              Teste se as notificações estão funcionando corretamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Clique no botão abaixo para enviar uma notificação de teste
              </p>
              <Button 
                onClick={sendTestNotification} 
                disabled={!isSupported || loading}
                className="gap-2"
              >
                <Bell className="h-4 w-4" />
                Enviar Notificação de Teste
              </Button>
              
              {testNotificationSent && (
                <Badge className="mt-4 bg-green-100 text-green-800">
                  Notificação enviada com sucesso!
                </Badge>
              )}
            </div>

            {!isSupported && (
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-800">
                  Notificações push não são suportadas neste navegador
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Notificações (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
          <CardDescription>
            Últimas notificações enviadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Histórico de notificações em desenvolvimento...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;