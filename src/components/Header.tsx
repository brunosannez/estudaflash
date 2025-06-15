
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings, BookOpen, Trophy, Brain, FileText, BarChart3, Target, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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

const Header = () => {
  const { user, signOut } = useAuth();
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

  const navigationItems = [
    { icon: BookOpen, label: 'Resumos', path: '/meus-resumos', emoji: '📚' },
    { icon: Brain, label: 'Flashcards', path: '/meus-flashcards', emoji: '🧠' },
    { icon: Target, label: 'Quiz', path: '/historico-quiz', emoji: '🎯' },
    { icon: Trophy, label: 'Progresso', path: '/progresso', emoji: '🏆' },
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
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-sm sm:text-lg">🎓</span>
            </div>
            <div>
              <h1 className={`${designColors.responsive.cardTitle} font-bold text-gray-700`}>
                EstudoFácil AI
              </h1>
              <p className={`${designColors.responsive.captionText} text-gray-600 hidden sm:block`}>
                ✨ Aprender nunca foi tão divertido!
              </p>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 transition-all ${designColors.animations.buttonHover}`}
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
                  {navigationItems.map((item) => (
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
                    {user?.email?.split('@')[0] || 'Usuário'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border-2 border-purple-200 shadow-xl">
                <DropdownMenuItem 
                  onClick={() => navigate('/progresso')}
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
      </div>
    </header>
  );
};

export default Header;
