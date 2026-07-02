import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFriendships } from '@/hooks/useFriendships';
import { Users, Search, UserPlus, Check, X, UserMinus } from 'lucide-react';
import { SocialLoading } from '@/components/common/LoadingStates';

interface FriendsListProps {
  className?: string;
}

export function FriendsList({ className }: FriendsListProps) {
  const {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    respondToFriendRequest,
    removeFriend,
    searchUsers
  } = useFriendships();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 3) {
      setSearching(true);
      const results = await searchUsers(query);
      setSearchResults(results);
      setSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  if (loading) {
    return <SocialLoading />;
  }

  return (
    <div className={className}>
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="friends">
            <Users className="h-4 w-4 mr-2" />
            Amigos ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            <UserPlus className="h-4 w-4 mr-2" />
            Solicitações ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Enviadas ({sentRequests.length})
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Meus Amigos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {friends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Você ainda não tem amigos</p>
                  <p className="text-sm">Use a busca para encontrar e adicionar amigos!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {friends.map(friend => (
                    <div key={friend.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={friend.avatar_url} />
                          <AvatarFallback>
                            {friend.display_name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{friend.display_name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary">Nível {friend.current_level}</Badge>
                            <span>{friend.total_xp} XP</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Remover ${friend.display_name} dos seus amigos?`)) {
                            removeFriend(friend.id);
                          }
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Recebidas</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma solicitação pendente</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingRequests.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">Usuário</h4>
                          <p className="text-sm text-muted-foreground">
                            Solicitação enviada em {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => respondToFriendRequest(request.id, 'accepted')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => respondToFriendRequest(request.id, 'blocked')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Enviadas</CardTitle>
            </CardHeader>
            <CardContent>
              {sentRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma solicitação enviada</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sentRequests.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">Usuário</h4>
                          <p className="text-sm text-muted-foreground">
                            Enviada em {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Pendente</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Usuários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Digite o nome do usuário..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {searching && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="grid gap-4">
                  {searchResults.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.display_name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{user.display_name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary">Nível {user.current_level}</Badge>
                            <span>{user.total_xp} XP</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => sendFriendRequest(user.user_id)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.trim().length >= 3 && !searching && searchResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum usuário encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}