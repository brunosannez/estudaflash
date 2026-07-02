
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import BrandLogo, { BrandWordmark } from '@/components/common/BrandLogo';
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
  Users,
  Bell,
  Crown
} from 'lucide-react';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
    { href: '/choose-plan', icon: Crown, label: 'Meu Plano' },
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
    <div className="flex flex-col h-full bg-card">
      <div className="p-6 border-b border-border bg-card">
        <Link to="/" className="flex items-center gap-3" onClick={onItemClick}>
          <BrandLogo size={38} className="rounded-[11px]" />
          <BrandWordmark className="text-xl" />
        </Link>
      </div>

      <nav className="flex-1 p-4 bg-card">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                onClick={onItemClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActiveRoute(item.href)
                    ? 'bg-muted/50 text-primary border border-primary/20 shadow-sm'
                    : 'text-foreground/80 hover:bg-gradient-to-r hover:opacity-90 hover:text-primary'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border bg-card">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted/50 text-primary">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">{getDisplayName()}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border border-border shadow-lg">
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
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50">
        <SidebarContent />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-50 h-16">
        <div className="flex items-center justify-between h-full px-4">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo size={32} className="rounded-[9px]" />
            <BrandWordmark className="text-lg" />
          </Link>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <NotificationCenter />
              </PopoverContent>
            </Popover>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-card border-r border-border">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu de navegação</SheetTitle>
                </SheetHeader>
                <SidebarContent onItemClick={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="lg:hidden h-16"></div>
    </>
  );
};

export default MainNavigation;
