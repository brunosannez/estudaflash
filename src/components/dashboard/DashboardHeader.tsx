
import { Sparkles } from 'lucide-react';
import { designColors } from '@/utils/designSystem';
import { useUserProfile } from '@/hooks/useUserProfile';

const DashboardHeader = () => {
  const { getDisplayName } = useUserProfile();

  return (
    <div className="pt-8 mb-4 sm:mb-8">
      <div className="flex items-center justify-center mb-4">
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <Sparkles className={`${designColors.responsive.pageIcon} text-cyan-500 animate-pulse`} />
            <h1 className={`${designColors.responsive.pageTitle} font-bold bg-gradient-to-r from-gray-700 via-purple-600 to-cyan-600 bg-clip-text text-transparent`}>
              Olá, {getDisplayName()}!
            </h1>
            <Sparkles className={`${designColors.responsive.pageIcon} text-purple-500 animate-pulse`} />
          </div>
        </div>
      </div>

      <div className={`${designColors.cards.accent} p-3 sm:p-4 max-w-4xl mx-auto`}>
        <p className={`${designColors.responsive.heroText} text-gray-700 font-medium text-center`}>
          🎓 Transforme suas imagens de estudo em aventuras de aprendizado incríveis! ✨
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
