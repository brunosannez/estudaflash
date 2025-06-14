
import { Upload, TrendingUp, Brain, Target } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { designColors } from '@/utils/designSystem';

interface DashboardTabsProps {
  activeTab: string;
}

const DashboardTabs = ({ activeTab }: DashboardTabsProps) => {
  return (
    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 sm:mb-8 bg-white/80 backdrop-blur-sm p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-lg border border-cyan-200">
      <TabsTrigger 
        value="upload" 
        className={`flex items-center space-x-1 sm:space-x-2 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm ${
          activeTab === 'upload' 
            ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-lg transform scale-105' 
            : 'hover:bg-purple-50 hover:scale-102 text-gray-700'
        }`}
      >
        <Upload className={designColors.responsive.buttonIcon} />
        <span className="font-semibold">📤 Upload</span>
      </TabsTrigger>
      <TabsTrigger 
        value="progress" 
        className={`flex items-center space-x-1 sm:space-x-2 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm ${
          activeTab === 'progress' 
            ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-white shadow-lg transform scale-105' 
            : 'hover:bg-cyan-50 hover:scale-102 text-gray-700'
        }`}
      >
        <TrendingUp className={designColors.responsive.buttonIcon} />
        <span className="font-semibold hidden sm:inline">📈 Progresso</span>
        <span className="font-semibold sm:hidden">📈</span>
      </TabsTrigger>
      <TabsTrigger 
        value="flashcards" 
        className={`flex items-center space-x-1 sm:space-x-2 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm ${
          activeTab === 'flashcards' 
            ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg transform scale-105' 
            : 'hover:bg-green-50 hover:scale-102 text-gray-700'
        }`}
      >
        <Brain className={designColors.responsive.buttonIcon} />
        <span className="font-semibold hidden sm:inline">🧠 Flashcards</span>
        <span className="font-semibold sm:hidden">🧠</span>
      </TabsTrigger>
      <TabsTrigger 
        value="quizzes" 
        className={`flex items-center space-x-1 sm:space-x-2 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm ${
          activeTab === 'quizzes' 
            ? 'bg-gradient-to-r from-purple-400 to-cyan-500 text-white shadow-lg transform scale-105' 
            : 'hover:bg-purple-50 hover:scale-102 text-gray-700'
        }`}
      >
        <Target className={designColors.responsive.buttonIcon} />
        <span className="font-semibold hidden sm:inline">🎯 Quizzes</span>
        <span className="font-semibold sm:hidden">🎯</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default DashboardTabs;
