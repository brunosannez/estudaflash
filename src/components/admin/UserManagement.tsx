
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Shield } from 'lucide-react';
import { PlanManagementService, type UserWithPlan } from '@/services/planManagementService';
import { PlanType, PLAN_CONFIGS } from '@/types/plans';

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());
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
      
      // Atualizar estado local
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
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <CardTitle>Gerenciamento de Usuários</CardTitle>
        </div>
        <p className="text-sm text-gray-600">
          {users.length} usuários registrados
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum usuário encontrado.</p>
            </div>
          ) : (
            users.map(user => (
              <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-medium text-gray-900 truncate">
                      {user.email}
                    </p>
                    <Badge variant={PLAN_CONFIGS[user.plano].badgeVariant}>
                      {PLAN_CONFIGS[user.plano].displayName}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Uploads: {user.uploads_realizados} | Flashcards: {user.flashcards_gerados} | Quizzes: {user.quizzes_realizados}</p>
                    <p>Último reset: {new Date(user.data_ultimo_reset).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Select
                    value={user.plano}
                    onValueChange={(newPlan: PlanType) => handlePlanChange(user.user_id, newPlan)}
                    disabled={updatingUsers.has(user.user_id)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">FREE</SelectItem>
                      <SelectItem value="pro">PRO</SelectItem>
                      <SelectItem value="edu">EDU</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {updatingUsers.has(user.user_id) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={fetchUsers}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Atualizando...
              </>
            ) : (
              'Atualizar lista'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
