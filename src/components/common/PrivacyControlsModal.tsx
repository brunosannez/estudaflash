import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Shield, Eye, EyeOff, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';
import { useAuth } from '@/hooks/useAuth';

interface UserSocialProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  is_public: boolean;
  privacy_level: string;
  total_xp: number;
  current_level: number;
  badges: any;
  stats: any;
  created_at: string;
  updated_at: string;
}

interface PrivacyControlsModalProps {
  children: React.ReactNode;
}

export const PrivacyControlsModal: React.FC<PrivacyControlsModalProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logPrivacyChange } = useSecurityAudit();
  const [profile, setProfile] = useState<UserSocialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [privacyLevel, setPrivacyLevel] = useState<string>('public');

  useEffect(() => {
    if (isOpen && user) {
      fetchProfile();
    }
  }, [isOpen, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_social_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setPrivacyLevel(data.privacy_level || 'public');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erro ao carregar perfil",
        description: "Não foi possível carregar as configurações de privacidade.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacySettings = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const updatedProfile = {
        privacy_level: privacyLevel,
        is_public: privacyLevel === 'public',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_social_profiles')
        .upsert({
          user_id: user.id,
          display_name: profile?.display_name || user.email?.split('@')[0] || 'Usuário',
          ...updatedProfile
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Log privacy change for security audit
      await logPrivacyChange(privacyLevel);

      toast({
        title: "Configurações salvas",
        description: "Suas configurações de privacidade foram atualizadas com sucesso."
      });

      setIsOpen(false);
      
    } catch (error: any) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações de privacidade.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const privacyOptions = [
    {
      value: 'public',
      label: 'Público',
      description: 'Seu perfil é visível para todos os usuários logados',
      icon: <Eye className="h-4 w-4" />
    },
    {
      value: 'friends_only',
      label: 'Apenas Amigos',
      description: 'Apenas seus amigos podem ver seu perfil completo',
      icon: <Users className="h-4 w-4" />
    },
    {
      value: 'private',
      label: 'Privado',
      description: 'Seu perfil não é visível para outros usuários',
      icon: <EyeOff className="h-4 w-4" />
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurações de Privacidade
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse">Carregando configurações...</div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Controle de Visibilidade do Perfil
                </CardTitle>
                <CardDescription>
                  Escolha quem pode ver suas informações e atividades no perfil social.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={privacyLevel} onValueChange={setPrivacyLevel}>
                  {privacyOptions.map((option) => (
                    <div key={option.value} className="flex items-start space-x-3 space-y-0">
                      <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                      <div className="flex-1">
                        <Label htmlFor={option.value} className="flex items-center gap-2 font-medium cursor-pointer">
                          {option.icon}
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {privacyLevel !== 'public' && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">Proteção de Privacidade Ativa</p>
                      <p className="text-yellow-700 mt-1">
                        {privacyLevel === 'private' 
                          ? 'Seu perfil está completamente privado e não será visível para outros usuários.'
                          : 'Apenas usuários autorizados poderão ver seu perfil completo.'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePrivacySettings}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};