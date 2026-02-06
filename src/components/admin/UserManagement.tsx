
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Search, 
  Trash2, 
  RotateCcw,
  Loader2,
  Filter,
  MoreHorizontal,
  ShieldX,
  ShieldCheck,
  RefreshCw,
  Download,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { AdminUserService, type UserWithPlan } from '@/services/adminUserService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import UserBlockModal from './UserBlockModal';
import { useAdminRealTime } from '@/hooks/admin/useAdminRealTime';
import { supabase } from '@/integrations/supabase/client';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithPlan | null>(null);
  const [changingPlanUserId, setChangingPlanUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real-time updates
  useAdminRealTime({
    enabled: true,
    onUserChange: () => {
      console.log('👤 UserManagement: Atualizando lista de usuários...');
    }
  });

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: AdminUserService.getAllUsersWithPlans,
    refetchInterval: 30000,
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || user.plano === planFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'blocked' && !user.is_active);
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await AdminUserService.toggleUserStatus(userId, isActive);

      toast({
        title: "Status atualizado",
        description: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso.`,
      });

      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do usuário.",
        variant: "destructive",
      });
    }
  };

  const handleBlockUser = async (reason: string) => {
    if (!selectedUser) return;
    
    try {
      await AdminUserService.blockUser(selectedUser.user_id, reason);

      toast({
        title: "Usuário bloqueado",
        description: `${selectedUser.email} foi bloqueado com sucesso.`,
      });

      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setBlockModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erro ao bloquear usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao bloquear usuário.",
        variant: "destructive",
      });
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await AdminUserService.unblockUser(userId);

      toast({
        title: "Usuário desbloqueado",
        description: "Usuário desbloqueado com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error) {
      console.error('Erro ao desbloquear usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao desbloquear usuário.",
        variant: "destructive",
      });
    }
  };

  const handleChangePlan = async (userId: string, newPlanId: string) => {
    try {
      setChangingPlanUserId(userId);
      await AdminUserService.changeUserPlan(userId, newPlanId);

      toast({
        title: "Plano alterado",
        description: `Plano alterado para ${newPlanId.toUpperCase()} com sucesso.`,
      });

      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error) {
      console.error('Erro ao alterar plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar plano do usuário.",
        variant: "destructive",
      });
    } finally {
      setChangingPlanUserId(null);
    }
  };

  const handleResetUserUsage = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('admin_reset_user_usage', {
        target_user_id: userId
      });

      if (error) throw error;

      toast({
        title: "Uso resetado",
        description: "Contadores de uso do usuário foram resetados.",
      });

      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error) {
      console.error('Erro ao resetar uso:', error);
      toast({
        title: "Erro",
        description: "Erro ao resetar uso do usuário.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUserData = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('admin_delete_user_data', {
        target_user_id: userId
      });

      if (error) throw error;

      toast({
        title: "Dados removidos",
        description: "Todos os dados do usuário foram removidos.",
      });

      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error) {
      console.error('Erro ao remover dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover dados do usuário.",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Plano', 'Status', 'Uploads', 'Flashcards', 'Quizzes', 'Storage MB', 'Admin', 'Criado em'];
    const rows = filteredUsers.map(user => [
      user.email,
      user.plano,
      user.is_active ? 'Ativo' : 'Bloqueado',
      user.uploads_realizados,
      user.flashcards_gerados,
      user.quizzes_realizados,
      user.storage_mb.toFixed(2),
      user.is_admin ? 'Sim' : 'Não',
      new Date(user.created_at).toLocaleDateString('pt-BR')
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: "Exportado",
      description: "Arquivo CSV gerado com sucesso.",
    });
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-secondary text-secondary-foreground';
      case 'pro': return 'bg-primary/10 text-primary';
      case 'edu': return 'bg-accent text-accent-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusBadge = (user: UserWithPlan) => {
    if (!user.is_active) {
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="destructive" className="text-xs">
            <ShieldX className="h-3 w-3 mr-1" />
            Bloqueado
          </Badge>
          {user.blocked_reason && (
            <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={user.blocked_reason}>
              {user.blocked_reason}
            </span>
          )}
        </div>
      );
    }
    return (
      <Badge variant="outline" className="text-xs border-green-500 text-green-600">
        <ShieldCheck className="h-3 w-3 mr-1" />
        Ativo
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Carregando usuários...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <p className="text-center text-destructive font-medium">Erro ao carregar usuários</p>
            <p className="text-center text-sm text-muted-foreground max-w-md">
              {error instanceof Error ? error.message : 'Erro desconhecido ao acessar o banco de dados.'}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <Badge variant="outline">{filteredUsers.length} usuários</Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-ring"
                >
                  <option value="all">Todos os planos</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="edu">EDU</option>
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-ring"
              >
                <option value="all">Todos status</option>
                <option value="active">Ativos</option>
                <option value="blocked">Bloqueados</option>
              </select>

              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead className="hidden md:table-cell">Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Uploads</TableHead>
                  <TableHead className="hidden lg:table-cell">Storage</TableHead>
                  <TableHead className="hidden md:table-cell">Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.user_id} className={!user.is_active ? 'opacity-60' : ''}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{user.email}</div>
                        {user.is_admin && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Admin
                          </Badge>
                        )}
                        <div className="md:hidden mt-1">
                          <Badge className={`text-xs ${getPlanBadgeColor(user.plano)}`}>
                            {user.plano.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="hidden md:table-cell">
                      <Badge className={getPlanBadgeColor(user.plano)}>
                        {user.plano.toUpperCase()}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {getStatusBadge(user)}
                    </TableCell>
                    
                    <TableCell className="hidden lg:table-cell">
                      {user.uploads_realizados}
                    </TableCell>
                    
                    <TableCell className="hidden lg:table-cell">
                      {user.storage_mb.toFixed(1)} MB
                    </TableCell>
                    
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger disabled={changingPlanUserId === user.user_id}>
                              <CreditCard className="h-4 w-4 mr-2" />
                              {changingPlanUserId === user.user_id ? 'Alterando...' : 'Alterar Plano'}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {['free', 'pro', 'edu'].map((plan) => (
                                <DropdownMenuItem
                                  key={plan}
                                  disabled={user.plano === plan}
                                  onClick={() => handleChangePlan(user.user_id, plan)}
                                >
                                  <Badge className={`mr-2 ${getPlanBadgeColor(plan)}`}>
                                    {plan.toUpperCase()}
                                  </Badge>
                                  {user.plano === plan ? '(atual)' : ''}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          
                          {user.is_active ? (
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
                                setBlockModalOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <ShieldX className="h-4 w-4 mr-2" />
                              Bloquear
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleUnblockUser(user.user_id)}
                              className="text-green-600"
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Desbloquear
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Resetar Uso
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Resetar uso do usuário</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Isso irá resetar todos os contadores de uso (uploads, flashcards, quizzes) para zero. Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleResetUserUsage(user.user_id)}>
                                  Resetar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir Dados
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover dados do usuário</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Isso irá remover TODOS os dados do usuário (uploads, resumos, flashcards, quizzes, progresso). Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteUserData(user.user_id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <UserBlockModal
        isOpen={blockModalOpen}
        onClose={() => {
          setBlockModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleBlockUser}
        userEmail={selectedUser?.email || ''}
      />
    </>
  );
};

export default UserManagement;
