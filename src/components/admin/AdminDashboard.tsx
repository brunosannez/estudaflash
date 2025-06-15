
import AdminStatsGrid from './AdminStatsGrid';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <AdminStatsGrid 
        totalUsers={0} 
        totalStorageMB={0} 
        activeUsers7Days={0} 
      />
    </div>
  );
};

export default AdminDashboard;
