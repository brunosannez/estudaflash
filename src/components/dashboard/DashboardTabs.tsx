
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { designColors } from '@/utils/designSystem';

interface DashboardTabsProps {
  activeTab: string;
}

const DashboardTabs = ({ activeTab }: DashboardTabsProps) => {
  return (
    <TabsList className={`${designColors.cards.primary} p-2 sm:p-3 mb-6 sm:mb-8 w-full justify-center grid grid-cols-4 gap-1 sm:gap-2 h-auto`}>
      <TabsTrigger 
        value="upload" 
        className={`
          ${designColors.responsive.tabButton} 
          ${designColors.animations.buttonHover}
          data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-purple-500 
          data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105
          hover:bg-purple-100 transition-all duration-300
          flex flex-col items-center justify-center
          h-16 sm:h-20 md:h-12
          text-center leading-tight
          font-bold
        `}
      >
        <span className="text-2xl sm:text-3xl md:text-xl mb-1 sm:mb-2 md:mb-1">📤</span>
        <span className="hidden md:inline text-xs sm:text-sm">Upload</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="progress" 
        className={`
          ${designColors.responsive.tabButton}
          ${designColors.animations.buttonHover}
          data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-green-500 
          data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105
          hover:bg-green-100 transition-all duration-300
          flex flex-col items-center justify-center
          h-16 sm:h-20 md:h-12
          text-center leading-tight
          font-bold
        `}
      >
        <span className="text-2xl sm:text-3xl md:text-xl mb-1 sm:mb-2 md:mb-1">📊</span>
        <span className="hidden md:inline text-xs sm:text-sm">Progresso</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="flashcards" 
        className={`
          ${designColors.responsive.tabButton}
          ${designColors.animations.buttonHover}
          data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-cyan-500 
          data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105
          hover:bg-cyan-100 transition-all duration-300
          flex flex-col items-center justify-center
          h-16 sm:h-20 md:h-12
          text-center leading-tight
          font-bold
        `}
      >
        <span className="text-2xl sm:text-3xl md:text-xl mb-1 sm:mb-2 md:mb-1">🧠</span>
        <span className="hidden md:inline text-xs sm:text-sm">Cartões</span>
      </TabsTrigger>
      
      <TabsTrigger 
        value="quizzes" 
        className={`
          ${designColors.responsive.tabButton}
          ${designColors.animations.buttonHover}
          data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-orange-500 
          data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105
          hover:bg-orange-100 transition-all duration-300
          flex flex-col items-center justify-center
          h-16 sm:h-20 md:h-12
          text-center leading-tight
          font-bold
        `}
      >
        <span className="text-2xl sm:text-3xl md:text-xl mb-1 sm:mb-2 md:mb-1">🎯</span>
        <span className="hidden md:inline text-xs sm:text-sm">Quizzes</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default DashboardTabs;
