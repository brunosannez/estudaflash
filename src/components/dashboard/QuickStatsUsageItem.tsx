
import { Progress } from '@/components/ui/progress';
import { LucideIcon } from 'lucide-react';

interface QuickStatsUsageItemProps {
  icon: LucideIcon;
  label: string;
  current: number;
  limit: number | null;
  percentage: number;
  color: string;
  isUnlimited: boolean;
}

const QuickStatsUsageItem = ({ 
  icon: Icon, 
  label, 
  current, 
  limit, 
  percentage, 
  color, 
  isUnlimited 
}: QuickStatsUsageItemProps) => {
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;
  const limitText = isUnlimited ? '∞' : (limit?.toString() || '');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="font-medium">{label}</span>
        </div>
        <span className={`text-xs ${isAtLimit ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
          {current}{limit ? ` / ${limitText}` : ''}
        </span>
      </div>
      {limit && !isUnlimited && (
        <Progress 
          value={Math.min(percentage, 100)} 
          className={`h-2 ${isNearLimit ? 'text-orange-500' : ''} ${isAtLimit ? 'text-red-500' : ''}`}
        />
      )}
    </div>
  );
};

export default QuickStatsUsageItem;
