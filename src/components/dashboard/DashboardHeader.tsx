
import { Sparkles } from 'lucide-react';
import { designColors } from '@/utils/designSystem';
import { useUserProfile } from '@/hooks/useUserProfile';

const DashboardHeader = () => {
  const { getDisplayName } = useUserProfile();

  return (
    <div className="pt-8 mb-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Olá, {getDisplayName()}!
          </h1>
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </div>
      </div>

      <div className="bg-muted/50 rounded-2xl p-6 max-w-4xl mx-auto border border-primary/20 shadow-lg">
        <p className="text-xl md:text-2xl text-foreground/80 font-medium text-center leading-relaxed">
          🎓 Transforme suas imagens de estudo em aventuras de aprendizado incríveis! ✨
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
