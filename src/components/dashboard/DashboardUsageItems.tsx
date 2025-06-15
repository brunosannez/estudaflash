
import { Progress } from '@/components/ui/progress';
import { Upload, Brain, TestTube, HardDrive, Trophy, AlertTriangle } from 'lucide-react';
import { PLAN_CONFIGS, PlanType } from '@/types/plans';
import { UsageData } from '@/services/usageLimitService';
import { StorageUsage } from '@/hooks/useStorageManagement';

interface DashboardUsageItemsProps {
  usageData: UsageData;
  storageUsage: StorageUsage;
  getStorageLimitForPlan: (plan: string) => number;
  getStoragePercentage: (usageMB: number, plan: string) => number;
  progressXP: number;
}

const DashboardUsageItems = ({ 
  usageData, 
  storageUsage, 
  getStorageLimitForPlan, 
  getStoragePercentage,
  progressXP 
}: DashboardUsageItemsProps) => {
  // Convert plan name to lowercase and ensure it's a valid PlanType
  const normalizedPlan = usageData.plano.toLowerCase() as PlanType;
  const planConfig = PLAN_CONFIGS[normalizedPlan] || PLAN_CONFIGS.free;
  const isUnlimited = normalizedPlan === 'edu';

  // Storage calculations
  const limitMB = getStorageLimitForPlan(usageData.plano);
  const usedMB = storageUsage.total_size_mb;
  const storagePercentage = getStoragePercentage(usedMB, usageData.plano);

  const usageItems = [
    {
      icon: Upload,
      label: 'Uploads',
      current: usageData.uploads_realizados,
      limit: planConfig.uploads,
      percentage: isUnlimited ? 0 : (usageData.uploads_realizados / planConfig.uploads) * 100,
      color: 'text-blue-600',
    },
    {
      icon: Brain,
      label: 'Flashcards',
      current: usageData.flashcards_gerados,
      limit: planConfig.flashcards,
      percentage: isUnlimited ? 0 : (usageData.flashcards_gerados / planConfig.flashcards) * 100,
      color: 'text-green-600',
    },
    {
      icon: TestTube,
      label: 'Quizzes',
      current: usageData.quizzes_realizados,
      limit: planConfig.quizzes,
      percentage: isUnlimited ? 0 : (usageData.quizzes_realizados / planConfig.quizzes) * 100,
      color: 'text-purple-600',
    },
    {
      icon: HardDrive,
      label: 'Armazenamento',
      current: usedMB,
      limit: limitMB,
      percentage: storagePercentage,
      color: 'text-orange-600',
      unit: 'MB'
    },
    {
      icon: Trophy,
      label: 'XP Total',
      current: progressXP,
      limit: null,
      percentage: 0,
      color: 'text-yellow-600',
      unit: 'XP'
    }
  ];

  return (
    <div className="space-y-4">
      {usageItems.map((item) => {
        const Icon = item.icon;
        const isNearLimit = item.percentage >= 80;
        const isAtLimit = item.percentage >= 100;
        const limitText = isUnlimited && item.limit ? '∞' : (item.limit?.toString() || '');
        const showProgress = item.limit && !isUnlimited;
        
        return (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${item.color}`} />
                <span className="font-medium">{item.label}</span>
                {(isNearLimit || isAtLimit) && item.limit && (
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                )}
              </div>
              <span className={`text-xs ${isAtLimit ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                {item.current}{item.unit ? ` ${item.unit}` : ''}{item.limit ? ` / ${limitText}${item.unit ? ` ${item.unit}` : ''}` : ''}
              </span>
            </div>
            {showProgress && (
              <Progress 
                value={Math.min(item.percentage, 100)} 
                className={`h-2 ${isNearLimit ? 'text-orange-500' : ''} ${isAtLimit ? 'text-red-500' : ''}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DashboardUsageItems;
