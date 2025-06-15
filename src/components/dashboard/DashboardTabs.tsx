
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { designColors } from '@/utils/designSystem';
import UploadTabContent from './UploadTabContent';
import ProgressTabContent from './ProgressTabContent';
import FlashcardsTabContent from './FlashcardsTabContent';
import QuizzesTabContent from './QuizzesTabContent';

interface DashboardTabsProps {
  activeTab: string;
}

const DashboardTabs = ({ activeTab }: DashboardTabsProps) => {
  return (
    <Tabs defaultValue={activeTab} className="w-full">
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
            h-16 sm:h-20 md:h-16
            text-center leading-tight
            font-bold
            px-1 sm:px-2
          `}
        >
          <span className="text-lg sm:text-2xl md:text-xl mb-1">📤</span>
          <span className="text-xs sm:text-sm font-bold leading-none">
            Enviar<br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>Fotos
          </span>
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
            h-16 sm:h-20 md:h-16
            text-center leading-tight
            font-bold
            px-1 sm:px-2
          `}
        >
          <span className="text-lg sm:text-2xl md:text-xl mb-1">📊</span>
          <span className="text-xs sm:text-sm font-bold leading-none">
            Meu<br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>Progresso
          </span>
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
            h-16 sm:h-20 md:h-16
            text-center leading-tight
            font-bold
            px-1 sm:px-2
          `}
        >
          <span className="text-lg sm:text-2xl md:text-xl mb-1">🧠</span>
          <span className="text-xs sm:text-sm font-bold leading-none">
            Cartões<br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>Estudo
          </span>
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
            h-16 sm:h-20 md:h-16
            text-center leading-tight
            font-bold
            px-1 sm:px-2
          `}
        >
          <span className="text-lg sm:text-2xl md:text-xl mb-1">🎯</span>
          <span className="text-xs sm:text-sm font-bold leading-none">
            Jogos<br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>Quiz
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="mt-6">
        <UploadTabContent />
      </TabsContent>

      <TabsContent value="progress" className="mt-6">
        <ProgressTabContent />
      </TabsContent>

      <TabsContent value="flashcards" className="mt-6">
        <FlashcardsTabContent />
      </TabsContent>

      <TabsContent value="quizzes" className="mt-6">
        <QuizzesTabContent />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
