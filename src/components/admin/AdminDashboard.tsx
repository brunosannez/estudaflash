
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminStatsGrid from './AdminStatsGrid';
import UserManagement from './UserManagement';
import DataManagement from './DataManagement';
import PlansManagement from '@/components/plans/PlansManagement';

const AdminDashboard = () => {
  return (
    <Tabs defaultValue="stats" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        <TabsTrigger value="users">Usuários</TabsTrigger>
        <TabsTrigger value="plans">Planos</TabsTrigger>
        <TabsTrigger value="data">Dados</TabsTrigger>
      </TabsList>

      <TabsContent value="stats">
        <AdminStatsGrid 
          totalUsers={0} 
          totalStorageMB={0} 
          activeUsers7Days={0} 
        />
      </TabsContent>

      <TabsContent value="users">
        <UserManagement />
      </TabsContent>

      <TabsContent value="plans">
        <PlansManagement />
      </TabsContent>

      <TabsContent value="data">
        <DataManagement />
      </TabsContent>
    </Tabs>
  );
};

export default AdminDashboard;
