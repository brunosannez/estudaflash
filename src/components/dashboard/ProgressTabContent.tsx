
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ProgressOverview from '@/components/ProgressOverview';
import RecentActivity from '@/components/RecentActivity';
import { designColors } from '@/utils/designSystem';

const ProgressTabContent = () => {
  const navigate = useNavigate();

  return (
    <div className={designColors.responsive.sectionSpacing}>
      <div className={`${designColors.cards.accent} p-4 sm:p-6 text-center`}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl animate-pulse">
              🏆
            </div>
            <h2 className={`${designColors.responsive.sectionTitle} font-bold bg-gradient-to-r from-gray-700 to-purple-600 bg-clip-text text-transparent`}>
              Seu Progresso Incrível!
            </h2>
          </div>
          <Button 
            onClick={() => navigate('/progresso')}
            className={`${designColors.buttons.primary} text-white font-bold ${designColors.responsive.buttonPadding} rounded-xl shadow-lg ${designColors.animations.buttonHover} text-xs sm:text-sm`}
          >
            ✨ Ver Detalhes Completos
          </Button>
        </div>
      </div>
      <div className={`grid ${designColors.responsive.gridCols2} gap-4 sm:gap-6`}>
        <div className={`${designColors.cards.primary} ${designColors.animations.cardHover}`}>
          <ProgressOverview />
        </div>
        <div className={`${designColors.cards.primary} ${designColors.animations.cardHover}`}>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default ProgressTabContent;
