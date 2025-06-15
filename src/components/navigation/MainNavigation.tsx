
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  BookOpen,
  Brain,
  Target,
  Trophy,
  Upload,
  Home,
  Shield,
  User,
  LogOut,
  BarChart3,
} from 'lucide-react';

interface MainNavigationProps {
  children: React.ReactNode;
}

const MainNavigation = ({ children }: MainNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  const mainMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/', emoji: '🏠' },
    { icon: Upload, label: 'Upload', path: '/upload', emoji: '📤' },
    { icon: BookOpen, label: 'Meus Resumos', path: '/meus-resumos', emoji: '📚' },
    { icon: Brain, label: 'Flashcards', path: '/meus-flashcards', emoji: '🧠' },
    { icon: Target, label: 'Quiz', path: '/historico-quiz', emoji: '🎯' },
    { icon: Trophy, label: 'Progresso', path: '/progresso', emoji: '🏆' },
  ];

  const adminMenuItems = [
    { icon: Shield, label: 'Admin Panel', path: '/admin', emoji: '⚡' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics', emoji: '📊' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/home');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Sidebar className="border-r-2 border-purple-200/50">
          <SidebarHeader className="p-4">
            <div 
              className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-purple-50 transition-colors"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-lg">🎓</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-700">EstudoFácil AI</h1>
                <p className="text-sm text-gray-600">✨ Aprender nunca foi tão divertido!</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-2">
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActiveRoute(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.emoji} {item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            {isAdmin && (
              <>
                <SidebarSeparator className="my-4" />
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Administração</p>
                </div>
                <SidebarMenu>
                  {adminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.path)}
                        isActive={isActiveRoute(item.path)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-red-700 hover:bg-red-50"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.emoji} {item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </>
            )}
          </SidebarContent>

          <SidebarFooter className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 truncate">
                  {user?.email?.split('@')[0] || 'Usuário'}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-purple-200/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-purple-50" />
              <div className="h-6 w-px bg-purple-200" />
              <div className="flex-1">
                {/* Breadcrumbs will be added here */}
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainNavigation;
