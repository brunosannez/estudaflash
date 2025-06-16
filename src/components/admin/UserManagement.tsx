
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
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  Trash2, 
  RotateCcw,
  Loader2,
  Filter
} from 'lucide-react';
import { AdminUserService } from '@/services/adminUserService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: AdminUserService.getAllUsersWithPlans,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === 'all' || user.plano === planFilter;
    return matchesSearch && matchesPlan;
  });

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.rpc('admin_toggle_user_status', {
        target_user_id: userId,
        is_active: isActive
      });

      if (error) throw error;

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

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'edu': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
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
          <p className="text-center text-red-600">Erro ao carregar usuários.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <Badge variant="outline">{filteredUsers.length} usuários</Badge>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos os planos</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="edu">EDU</option>
              </select>
            </div>
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
                <TableHead className="hidden lg:table-cell">Uploads</TableHead>
                <TableHead className="hidden lg:table-cell">Flashcards</TableHead>
                <TableHead className="hidden lg:table-cell">Quizzes</TableHead>
                <TableHead className="hidden md:table-cell">Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
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
                  
                  <TableCell className="hidden lg:table-cell">
                    {user.uploads_realizados}
                  </TableCell>
                  
                  <TableCell className="hidden lg:table-cell">
                    {user.flashcards_gerados}
                  </TableCell>
                  
                  <TableCell className="hidden lg:table-cell">
                    {user.quizzes_realizados}
                  </TableCell>
                  
                  <TableCell className="hidden md:table-cell text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col sm:flex-row gap-1">
                      <Button
                        onClick={() => handleToggleUserStatus(user.user_id, !user.is_admin)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        {user.is_admin ? (
                          <UserX className="h-3 w-3" />
                        ) : (
                          <UserCheck className="h-3 w-3" />
                        )}
                        <span className="hidden sm:ml-1 sm:inline">
                          {user.is_admin ? 'Desativar' : 'Ativar'}
                        </span>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs">
                            <RotateCcw className="h-3 w-3" />
                            <span className="hidden sm:ml-1 sm:inline">Reset</span>
                          </Button>
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
                          <Button variant="outline" size="sm" className="text-xs text-red-600 hover:text-red-700">
                            <Trash2 className="h-3 w-3" />
                            <span className="hidden sm:ml-1 sm:inline">Dados</span>
                          </Button>
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
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum usuário encontrado.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;
