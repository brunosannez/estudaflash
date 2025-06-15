
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface AdminSystemAlertProps {
  systemHealth: 'healthy' | 'warning' | 'error';
}

const AdminSystemAlert = ({ systemHealth }: AdminSystemAlertProps) => {
  if (systemHealth !== 'error') {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-orange-700">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            Sistema operando em modo fallback. Execute o diagnóstico para mais informações.
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSystemAlert;
