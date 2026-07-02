
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Upload, Trophy } from 'lucide-react';
import DashboardUsageOverview from './DashboardUsageOverview';
import UploadTabContent from './UploadTabContent';

const DashboardTabs = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/70 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-primary/20">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-primary data-[state=active]:text-white rounded-lg transition-all"
          >
            <BarChart3 className="w-5 h-5" />
            📊 Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="upload" 
            className="flex items-center gap-2 text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-primary data-[state=active]:text-white rounded-lg transition-all"
          >
            <Upload className="w-5 h-5" />
            📤 Upload
          </TabsTrigger>
          <TabsTrigger 
            value="progress" 
            className="flex items-center gap-2 text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-primary data-[state=active]:text-white rounded-lg transition-all"
          >
            <Trophy className="w-5 h-5" />
            🏆 Progresso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
              Bem-vindo ao seu painel de estudos!
            </h2>
            <DashboardUsageOverview />
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary/20">
            <UploadTabContent />
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-primary/20">
            <UploadTabContent />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTabs;
