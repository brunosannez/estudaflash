import { Coins } from 'lucide-react';
import { useCreditsSystem } from '@/hooks/useCreditsSystem';
import { cn } from '@/lib/utils';

interface CreditsCostBadgeProps {
  actionType: string;
  className?: string;
}

const CreditsCostBadge = ({ actionType, className }: CreditsCostBadgeProps) => {
  const { getActionCreditsCost, userCredits } = useCreditsSystem();

  const cost = getActionCreditsCost(actionType);
  if (cost === 0) return null;

  const hasEnough = userCredits ? userCredits.remaining >= cost : false;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full',
        hasEnough
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
