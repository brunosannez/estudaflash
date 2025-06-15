
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Shield, Trash2, RefreshCw, UserPlus, Activity, Download } from 'lucide-react';
import { PlanManagementService, type UserWithPlan } from '@/services/planManagementService';
import { PlanType, PLAN_CONFIGS } from '@/types/plans';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());
  const [deletingUsers, setDeletingUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await PlanManagementService.getAllUsersWithPlans();
      setUsers(userData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = async (userId: string, newPlan: PlanType) => {
    try {
      setUpdatingUsers(prev => new Set(prev.add(userId)));
      
      await PlanManagementService.changeuserPlan(userId, newPlan);
      
      setUsers(prev => 
        prev.map(user => 
          user.user_id === userId 
            ? { ...user, plano: newPlan }
            : user
        )
      );

      toast({
        title: "Sucesso!",
        description: `Plano alterado para ${PLAN_CONFIGS[newPlan].displayName} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao alterar plano:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar plano do usuário.",
        variant: "destructive",
      });
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handlePromoteToAdmin = async (userId: string, userEmail: string) => {
    try {
      setUpdatingUsers(prev => new Set(prev.add(userId)));
      
      const success = await PlanManagementService.promoteUserToAdmin(userEmail);
      
      if (success) {
        toast({
          title: "Sucesso!",
          description: `Usuário ${userEmail} promovido a administrador.`,
        });
        fetchUsers(); // Recarregar para mostrar status admin
      }
    } catch (error) {
      console.error('Erro ao promover usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao promover usuário a administrador.",
        variant: "destructive",
      });
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleResetUsage = async (userId: string) => {
    try {
      setUpdatingUsers(prev => new Set(prev.add(userId)));
      
      const success = await PlanManagementService.resetUserUsage(userId);
      
      if (success) {
        setUsers(prev => 
          prev.map(user => 
            user.user_id === userId 
              ? { 
                  ...user, 
                  uploads_realizados: 0,
                  flashcards_gerados: 0,
                  quizzes_realizados: 0,
                  data_ultimo_reset: new Date().toISOString()
                }
              : user
          )
        );

        toast({
          title: "Sucesso!",
          description: "Uso mensal resetado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao resetar uso:', error);
      toast({
        title: "Erro",
        description: "Erro ao resetar uso do usuário.",
        variant: "destructive",
      });
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleDeleteUserData = async (userId: string) => {
    try {
      setDeletingUsers(prev => new Set(prev.add(userId)));
      
      const success = await PlanManagementService.deleteUserData(userId);
      
      if (success) {
        setUsers(prev => prev.filter(user => user.user_id !== userId));
        toast({
          title: "Sucesso!",
          description: "Dados do usuário deletados com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao deletar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar dados do usuário.",
        variant: "destructive",
      });
    } finally {
      setDeletingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Email', 'Plano', 'Uploads', 'Flashcards', 'Quizzes', 'Último Reset'],
      ...users.map(user => [
        user.email,
        user.plano,
        user.uploads_realizados,
        user.flashcards_gerados,
        user.quizzes_realizados,
        new Date(user.data_ultimo_reset).toLocaleDateString('pt-BR')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `usuarios-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle>Gerenciamento de Usuários</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {users.length} usuários registrados
        </p>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Uso</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.email}</span>
                        <span className="text-xs text-gray-500">
                          ID: {user.user_id.slice(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={PLAN_CONFIGS[user.plano].badgeVariant}>
                        {PLAN_CONFIGS[user.plano].displayName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <div>📤 {user.uploads_realizados} uploads</div>
                        <div>🧠 {user.flashcards_gerados} flashcards</div>
                        <div>🎯 {user.quizzes_realizados} quizzes</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Select
                          value={user.plano}
                          onValueChange={(newPlan: PlanType) => handlePlanChange(user.user_id, newPlan)}
                          disabled={updatingUsers.has(user.user_id)}
                        >
                          <SelectTrigger className="w-20 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">FREE</SelectItem>
                            <SelectItem value="pro">PRO</SelectItem>
                            <SelectItem value="edu">EDU</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePromoteToAdmin(user.user_id, user.email)}
                          disabled={updatingUsers.has(user.user_id)}
                          className="h-8 px-2"
                        >
                          <UserPlus className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetUsage(user.user_id)}
                          disabled={updatingUsers.has(user.user_id)}
                          className="h-8 px-2"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={deletingUsers.has(user.user_id)}
                              className="h-8 px-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deletar dados do usuário</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação irá deletar permanentemente todos os dados de {user.email}: uploads, resumos, flashcards e quizzes.
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUserData(user.user_id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        {(updatingUsers.has(user.user_id) || deletingUsers.has(user.user_id)) && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;
