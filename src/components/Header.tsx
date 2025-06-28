
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings, BookOpen, Trophy, Brain, FileText, BarChart3, Target, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { designColors } from '@/utils/designSystem';
import AppBreadcrumbs from '@/components/navigation/AppBreadcrumbs';

const Header = () => {
  const { signOut } = useAuth();
  const { getDisplayName } = useUserProfile();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/home');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const quickActions = [
    { icon: BookOpen, label: 'Resumos', path: '/my-summaries', emoji: '📚' },
    { icon: Brain, label: 'Flashcards', path: '/my-flashcards', emoji: '🧠' },
    { icon: Target, label: 'Quiz', path: '/quiz-history', emoji: '🎯' },
    { icon: Trophy, label: 'Progresso', path: '/my-progress', emoji: '🏆' },
  ];

  return (
    <header className={`${designColors.backgrounds.header} sticky top-0 z-50 shadow-xl`}>
      <div className={`container mx-auto ${designColors.responsive.containerPadding} py-3 sm:py-4`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 via-purple-500/30 to-pink-500/30 animate-ping"></div>
                <Zap className="text-sm sm:text-lg text-white relative z-10 animate-bounce" />
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
            </div>
            <div className="relative">
              <h1 className={`${designColors.responsive.cardTitle} font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                Estuda Flash
              </h1>
              <p className={`${designColors.responsive.captionText} bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent hidden sm:block font-medium`}>
                ⚡ Aprender nunca foi tão rápido!
              </p>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-50 hidden sm:block"></div>
            </div>
          </div>

          {/* Breadcrumbs - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 justify-center px-8">
            <AppBreadcrumbs />
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            {quickActions.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-purple-50 hover:text-purple-700 transition-all ${designColors.animations.buttonHover}`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.emoji} {item.label}</span>
              </Button>
            ))}
            
            {/* Admin Panel Link */}
            {isAdmin && (
              <Button
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all"
              >
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">⚡ Admin</span>
              </Button>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-2 border-cyan-300 text-gray-700 hover:bg-cyan-50">
                    <BarChart3 className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border-2 border-cyan-200 shadow-xl">
                  {quickActions.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-cyan-50"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.emoji} {item.label}</span>
                    </DropdownMenuItem>
                  ))}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => navigate('/admin')}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-red-50 text-red-600"
                      >
                        <Shield className="h-4 w-4" />
                        <span>⚡ Admin Panel</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-1 sm:space-x-2 border-2 border-purple-300 text-gray-700 hover:bg-purple-50 shadow-lg"
                >
                  <User className={designColors.responsive.buttonIcon} />
                  <span className={`font-medium ${designColors.responsive.captionText} max-w-20 sm:max-w-none truncate`}>
                    {getDisplayName()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border-2 border-purple-200 shadow-xl">
                <DropdownMenuItem 
                  onClick={() => navigate('/my-progress')}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-purple-50"
                >
                  <Settings className="h-4 w-4" />
                  <span>📊 Meu Progresso</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem 
                    onClick={() => navigate('/admin')}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-red-50 text-red-600"
                  >
                    <Shield className="h-4 w-4" />
                    <span>⚡ Admin Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-purple-200" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-red-50 text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>🚪 Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Breadcrumbs */}
        <div className="lg:hidden mt-3 pt-3 border-t border-purple-200/50">
          <AppBreadcrumbs />
        </div>
      </div>
    </header>
  );
};

export default Header;
