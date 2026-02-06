
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUsageData } from '@/hooks/useUsageData';

const UpgradeBanner = () => {
  const navigate = useNavigate();
  const { usageData, loading } = useUsageData();
  const [dismissed, setDismissed] = useState(false);

  if (loading || dismissed) return null;

  const currentPlan = usageData?.plano?.toLowerCase() || 'free';
  if (currentPlan !== 'free') return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 p-5 text-white shadow-xl">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Crown className="w-6 h-6" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold">Você está no plano Free</h3>
          <p className="text-sm text-white/80 mt-0.5">
            Desbloqueie uploads, flashcards e quizzes ilimitados com um plano premium!
          </p>
        </div>

        <Button
          onClick={() => navigate('/choose-plan')}
          className="shrink-0 bg-white text-violet-700 hover:bg-white/90 font-semibold shadow-md"
        >
          Ver Planos <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
    </div>
  );
};

export default UpgradeBanner;
