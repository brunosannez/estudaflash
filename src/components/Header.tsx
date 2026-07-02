
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
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
    { icon: Target, label: 'Quiz ENEM', path: '/my-summaries', emoji: '🎯' },
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
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className={`${designColors.responsive.cardTitle} font-bold text-foreground`}>
                Estuda Flash
              </h1>
              <p className={`${designColors.responsive.captionText} hidden sm:block`}>
                Aprender nunca foi tão rápido
              </p>
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
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-foreground/80 hover:bg-gradient-to-r hover:opacity-90 hover:text-primary transition-all ${designColors.animations.buttonHover}`}
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
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-foreground/80 hover:bg-red-50 hover:text-red-700 transition-all"
              >
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">⚡ Admin</span>
              </Button>
            )}
          </nav>

          {/* Credits Badge + User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <ThemeToggle />
            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-border">
                    <BarChart3 className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-md">
                  {quickActions.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-muted"
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
                        className="flex items-center space-x-2 cursor-pointer text-destructive focus:text-destructive"
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
                  className="flex items-center space-x-1 sm:space-x-2 border-2 border-purple-300 text-foreground/80 hover:bg-primary/5 shadow-lg"
                >
                  <User className={designColors.responsive.buttonIcon} />
                  <span className={`font-medium ${designColors.responsive.captionText} max-w-20 sm:max-w-none truncate`}>
                    {getDisplayName()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-2 border-primary/20 shadow-xl">
                <DropdownMenuItem 
                  onClick={() => navigate('/my-progress')}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-primary/5"
                >
                  <Settings className="h-4 w-4" />
                  <span>📊 Meu Progresso</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem 
                    onClick={() => navigate('/admin')}
                    className="flex items-center space-x-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Shield className="h-4 w-4" />
                    <span>⚡ Admin Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-purple-200" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>🚪 Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Breadcrumbs */}
        <div className="lg:hidden mt-3 pt-3 border-t border-primary/20/50">
          <AppBreadcrumbs />
        </div>
      </div>
    </header>
  );
};

export default Header;
