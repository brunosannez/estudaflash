import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreditsCostBadgeProps {
  actionType: string;
  className?: string;
  cost?: number;
  hasEnough?: boolean;
}

const CreditsCostBadge = ({ actionType, className, cost, hasEnough }: CreditsCostBadgeProps) => {
  // If cost is not provided or is 0, render nothing
  if (cost === undefined || cost === 0) return null;

  const enough = hasEnough ?? false;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full',
        enough
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-red-100 text-red-700',
        className
      )}
    >
      <Coins className="h-3 w-3" />
      {cost}
    </span>
  );
};

export default CreditsCostBadge;
