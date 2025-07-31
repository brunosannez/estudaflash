import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserSocialProfile } from '@/types/social';
import { Edit2, Save, X, Share2, Trophy } from 'lucide-react';

interface SocialProfileProps {
  profile: UserSocialProfile;
  onUpdate: (updates: Partial<UserSocialProfile>) => Promise<void>;
  onShare: (type: 'level', data: any, platform: 'whatsapp' | 'twitter') => void;
}

export const SocialProfile = ({ profile, onUpdate, onShare }: SocialProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    display_name: profile.display_name,
    bio: profile.bio || '',
    is_public: profile.is_public
  });

  const handleSave = async () => {
    await onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      display_name: profile.display_name,
      bio: profile.bio || '',
      is_public: profile.is_public
    });
    setIsEditing(false);
  };

  const handleShare = (platform: 'whatsapp' | 'twitter') => {
    onShare('level', {
      level: profile.current_level,
      xp: profile.total_xp
    }, platform);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Perfil Social
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('whatsapp')}
            >
              <Share2 className="h-4 w-4 mr-1" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('twitter')}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Twitter
            </Button>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and Basic Info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="text-lg">
              {profile.display_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            {isEditing ? (
              <Input
                value={editData.display_name}
                onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                placeholder="Nome de exibição"
              />
            ) : (
              <h3 className="text-xl font-semibold">{profile.display_name}</h3>
            )}
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                Nível {profile.current_level}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {profile.total_xp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          {isEditing ? (
            <Textarea
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              placeholder="Conte um pouco sobre você..."
              rows={3}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {profile.bio || 'Nenhuma bio adicionada ainda.'}
            </p>
          )}
        </div>

        {/* Privacy Settings */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Perfil Público</p>
            <p className="text-xs text-muted-foreground">
              Permitir que outros usuários vejam seu perfil
            </p>
          </div>
          {isEditing ? (
            <Switch
              checked={editData.is_public}
              onCheckedChange={(checked) => 
                setEditData({ ...editData, is_public: checked })
              }
            />
          ) : (
            <Switch checked={profile.is_public} disabled />
          )}
        </div>

        {/* Badges */}
        {profile.badges && profile.badges.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Conquistas</label>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge, index) => (
                <Badge key={index} variant="outline">
                  🏆 {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{profile.current_level}</p>
            <p className="text-xs text-muted-foreground">Nível</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{profile.total_xp}</p>
            <p className="text-xs text-muted-foreground">XP Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {Object.keys(profile.stats).length}
            </p>
            <p className="text-xs text-muted-foreground">Estatísticas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{profile.badges.length}</p>
            <p className="text-xs text-muted-foreground">Conquistas</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};