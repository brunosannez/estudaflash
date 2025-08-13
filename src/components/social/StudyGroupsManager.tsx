import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudyGroups } from '@/hooks/useStudyGroups';
import { Users, Plus, Globe, Lock, BookOpen, Trophy, Handshake, Calendar } from 'lucide-react';
import { SocialLoading } from '@/components/common/LoadingStates';

interface StudyGroupsManagerProps {
  className?: string;
}

export function StudyGroupsManager({ className }: StudyGroupsManagerProps) {
  const {
    myGroups,
    publicGroups,
    loading,
    createStudyGroup,
    joinGroup,
    leaveGroup,
    loadGroupMembers
  } = useStudyGroups();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    is_public: true,
    max_members: 20,
    group_type: 'study' as 'study' | 'competition' | 'collaboration'
  });

  const handleCreateGroup = async () => {
    const success = await createStudyGroup(newGroup);
    if (success) {
      setShowCreateDialog(false);
      setNewGroup({
        name: '',
        description: '',
        is_public: true,
        max_members: 20,
        group_type: 'study'
      });
    }
  };

  const getGroupTypeIcon = (type: string) => {
    const icons = {
      study: BookOpen,
      competition: Trophy,
      collaboration: Handshake
    };
    return icons[type as keyof typeof icons] || BookOpen;
  };

  const getGroupTypeColor = (type: string) => {
    const colors = {
      study: 'text-blue-600 bg-blue-50 border-blue-200',
      competition: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      collaboration: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[type as keyof typeof colors] || colors.study;
  };

  const getGroupTypeLabel = (type: string) => {
    const labels = {
      study: 'Estudo',
      competition: 'Competição',
      collaboration: 'Colaboração'
    };
    return labels[type as keyof typeof labels] || 'Estudo';
  };

  if (loading) {
    return <SocialLoading />;
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Grupos de Estudo</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Grupo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Grupo</Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome do grupo..."
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o objetivo do grupo..."
                />
              </div>

              <div>
                <Label htmlFor="group_type">Tipo do Grupo</Label>
                <Select
                  value={newGroup.group_type}
                  onValueChange={(value: 'study' | 'competition' | 'collaboration') => 
                    setNewGroup(prev => ({ ...prev, group_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="study">📚 Grupo de Estudo</SelectItem>
                    <SelectItem value="competition">🏆 Competição</SelectItem>
                    <SelectItem value="collaboration">🤝 Colaboração</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="max_members">Máximo de Membros</Label>
                <Input
                  id="max_members"
                  type="number"
                  value={newGroup.max_members}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, max_members: parseInt(e.target.value) }))}
                  min={2}
                  max={100}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={newGroup.is_public}
                  onCheckedChange={(checked) => setNewGroup(prev => ({ ...prev, is_public: checked }))}
                />
                <Label htmlFor="is_public">Grupo Público</Label>
              </div>

              <Button onClick={handleCreateGroup} className="w-full">
                Criar Grupo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="my-groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-groups">
            Meus Grupos ({myGroups.length})
          </TabsTrigger>
          <TabsTrigger value="public-groups">
            Grupos Públicos ({publicGroups.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="space-y-4">
          {myGroups.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Você ainda não participa de nenhum grupo</p>
                <p className="text-sm text-muted-foreground">Crie um grupo ou participe de grupos públicos!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myGroups.map(group => {
                const TypeIcon = getGroupTypeIcon(group.group_type);
                return (
                  <Card key={group.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="flex items-center gap-2">
                            <TypeIcon className="h-5 w-5" />
                            {group.name}
                          </CardTitle>
                          {group.description && (
                            <p className="text-sm text-muted-foreground">{group.description}</p>
                          )}
                        </div>
                        <Badge className={getGroupTypeColor(group.group_type)}>
                          {getGroupTypeLabel(group.group_type)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {group.member_count || 0}/{group.max_members} membros
                          </span>
                          <span className="flex items-center gap-1">
                            {group.is_public ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                            {group.is_public ? 'Público' : 'Privado'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(group.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => leaveGroup(group.id)}
                        >
                          Sair do Grupo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public-groups" className="space-y-4">
          {publicGroups.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Nenhum grupo público disponível</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {publicGroups.map(group => {
                const TypeIcon = getGroupTypeIcon(group.group_type);
                return (
                  <Card key={group.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="flex items-center gap-2">
                            <TypeIcon className="h-5 w-5" />
                            {group.name}
                          </CardTitle>
                          {group.description && (
                            <p className="text-sm text-muted-foreground">{group.description}</p>
                          )}
                        </div>
                        <Badge className={getGroupTypeColor(group.group_type)}>
                          {getGroupTypeLabel(group.group_type)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {group.member_count || 0}/{group.max_members} membros
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(group.created_at).toLocaleDateString()}
                          </span>
                          {group.creator_name && (
                            <span>Por {group.creator_name}</span>
                          )}
                        </div>
                        {group.is_member ? (
                          <Badge variant="secondary">Membro</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => joinGroup(group.id)}
                          >
                            Participar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}