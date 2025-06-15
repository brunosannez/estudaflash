
import { Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { designColors } from '@/utils/designSystem';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const DashboardHeader = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  return (
    <div className="mb-4 sm:mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="text-center flex-1">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <Sparkles className={`${designColors.responsive.pageIcon} text-cyan-500 animate-pulse`} />
            <h1 className={`${designColors.responsive.pageTitle} font-bold bg-gradient-to-r from-gray-700 via-purple-600 to-cyan-600 bg-clip-text text-transparent`}>
              Olá, {user?.email?.split('@')[0]}! 
            </h1>
            <Sparkles className={`${designColors.responsive.pageIcon} text-purple-500 animate-pulse`} />
          </div>
        </div>
        
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin')}
            className="ml-4 text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <Shield className="h-4 w-4 mr-2" />
            Admin
          </Button>
        )}
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
