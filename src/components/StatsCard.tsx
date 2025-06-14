
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
}

const StatsCard = ({ title, value, icon: Icon, gradient }: StatsCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className={`${gradient} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{title}</p>
              <p className="text-3xl font-bold mt-1">{value}</p>
            </div>
            <Icon className="h-8 w-8 opacity-80" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
