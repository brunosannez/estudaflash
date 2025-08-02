
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Home, 
  Upload, 
  FileText, 
  Brain, 
  BarChart3, 
  User, 
  LogOut, 
  Menu,
  Shield,
  History,
  Target,
  Zap,
  Users
} from 'lucide-react';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const MainNavigation = () => {
  const { user, signOut } = useAuth();
  const { getDisplayName } = useUserProfile();
  const { isAdmin } = useIsAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/upload', icon: Upload, label: 'Upload' },
    { href: '/my-summaries', icon: FileText, label: 'Resumos' },
    { href: '/my-flashcards', icon: Brain, label: 'Flashcards' },
    { href: '/quiz-history', icon: History, label: 'Histórico Quiz' },
    { href: '/my-progress', icon: Target, label: 'Progresso' },
    { href: '/social', icon: Users, label: 'Social' },
  ];

  if (isAdmin) {
    navigationItems.push({ href: '/admin', icon: Shield, label: 'Admin' });
  }

  const handleSignOut = async () => {
    try {
      console.log('🚪 Signing out and redirecting to home');
      await signOut();
      navigate('/home', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === '/' && location.pathname === '/') return true;
    if (href !== '/' && location.pathname.startsWith(href)) return true;
    return false;
  };

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-gray-200 bg-white">
        <Link to="/" className="flex items-center gap-3" onClick={onItemClick}>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
              <Zap className="h-6 w-6 text-white relative z-10 animate-bounce" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
          </div>
          <div className="relative">
            <span className="font-bold text-xl bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Estuda Flash
            </span>
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-50"></div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 bg-white">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                onClick={onItemClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActiveRoute(item.href)
                    ? 'bg-gradient-to-r from-cyan-50 to-purple-50 text-purple-700 border border-purple-200 shadow-sm'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-purple-50 hover:text-purple-600'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 bg-white">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-cyan-100 to-purple-100 text-purple-700">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">{getDisplayName()}</span>
                  <span className="text-xs text-gray-500">{user?.email}</span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg">
            <DropdownMenuItem onClick={() => { navigate('/my-progress'); onItemClick?.(); }}>
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50">
        <SidebarContent />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-16">
        <div className="flex items-center justify-between h-full px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
                <Zap className="h-5 w-5 text-white relative z-10" />
              </div>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Estuda Flash
            </span>
          </Link>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-white border-r border-gray-200">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu de navegação</SheetTitle>
              </SheetHeader>
              <SidebarContent onItemClick={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="lg:hidden h-16"></div>
    </>
  );
};

export default MainNavigation;
